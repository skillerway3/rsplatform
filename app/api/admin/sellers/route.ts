import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && user.email !== 'skillerway100@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sellerId, manualTrustedOverride } = await req.json();

    if (!sellerId) {
      return NextResponse.json({ error: 'Missing seller ID' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Update manual_trusted_override
    // The trigger on_profile_trust_update will handle is_trusted_seller recalculation
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ manual_trusted_override: manualTrustedOverride })
      .eq('id', sellerId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Admin sellers API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
