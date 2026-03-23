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

    const { verificationId, status, rejectionReason } = await req.json();

    if (!verificationId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Update verification status
    const { data: verification, error: verificationError } = await supabaseAdmin
      .from('seller_verifications')
      .update({ 
        status, 
        rejection_reason: rejectionReason,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', verificationId)
      .select('user_id')
      .single();

    if (verificationError || !verification) throw verificationError;

    // 2. If approved, update profile is_verified_seller
    if (status === 'approved') {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ is_verified_seller: true })
        .eq('id', verification.user_id);

      if (profileError) throw profileError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin verifications API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
