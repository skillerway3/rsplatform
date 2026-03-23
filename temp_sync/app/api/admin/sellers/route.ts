import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const ADMIN_EMAIL = 'skillerway100@gmail.com';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = user.email === ADMIN_EMAIL;

    if (!isAdmin) {
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
  } catch (err: any) {
    console.error('Admin sellers API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
