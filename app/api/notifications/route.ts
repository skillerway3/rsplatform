import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    // 1. Check Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { type, requestId } = await request.json();

    if (type === 'buyer_request_fanout') {
      // 2. Verify Authorization: Fetch the request and check buyer_id and idempotency
      const { data: buyerRequest, error: requestError } = await supabaseAdmin
        .from('buyer_requests')
        .select('buyer_id, title, game, category, seller_notified_at')
        .eq('id', requestId)
        .single();

      if (requestError || !buyerRequest) {
        return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
      }

      if (buyerRequest.buyer_id !== user.id) {
        return NextResponse.json({ success: false, error: 'Forbidden: You do not own this request' }, { status: 403 });
      }

      if (buyerRequest.seller_notified_at) {
        return NextResponse.json({ success: true, message: 'Sellers already notified' });
      }

      // Atomically update seller_notified_at to prevent race conditions
      const { data: updatedRequest, error: updateError } = await supabaseAdmin
        .from('buyer_requests')
        .update({ seller_notified_at: new Date().toISOString() })
        .eq('id', requestId)
        .is('seller_notified_at', null)
        .select()
        .single();

      if (updateError || !updatedRequest) {
        // If no row was updated, it means another request already updated it
        return NextResponse.json({ success: true, message: 'Sellers already notified (concurrent)' });
      }

      // 3. Fetch all verified sellers
      const { data: sellers, error: sellersError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('is_verified_seller', true);

      if (sellersError) throw sellersError;

      if (sellers && sellers.length > 0) {
        // 4. Create notifications for each seller using DB data
        const notifications = sellers.map(seller => ({
          user_id: seller.id,
          type: 'system',
          title: 'New Buyer Request',
          content: `A new request for ${buyerRequest.game} (${buyerRequest.category}) has been posted: "${buyerRequest.title}"`,
          link: `/marketplace/requests/${requestId}`
        }));

        const { error: notifyError } = await supabaseAdmin
          .from('notifications')
          .insert(notifications);

        if (notifyError) throw notifyError;
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid notification type' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in notifications API:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
