import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    // 1) Authenticate user with normal client
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Use admin client for privileged writes
    const adminClient = getSupabaseAdmin();

    const body = await req.json().catch(() => ({}));
    const { amount, method = 'paypal', details = '' } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // 3) Process withdrawal request (Atomic via RPC)
    const { error: rpcErr } = await adminClient.rpc('process_wallet_withdrawal_request', {
      p_user_id: user.id,
      p_amount: Number(amount),
      p_description: `Withdrawal via ${method} (${details})`
    });

    if (rpcErr) throw rpcErr;

    // Fetch new balance to return to client
    const { data: profile } = await adminClient
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ success: true, newBalance: profile?.balance || 0 });
  } catch (err: any) {
    console.error('Withdrawal error:', err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
