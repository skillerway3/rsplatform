import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, adminNotes } = await request.json();

    // 1. Authenticate user with normal client
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Use admin client for privileged writes and checks
    const adminClient = getSupabaseAdmin();

    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!isAdmin(user, profile)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Get the transaction
    const { data: transaction, error: txError } = await adminClient
      .from("wallet_transactions")
      .select("id, type, status")
      .eq("id", id)
      .single();

    if (txError || !transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.type !== "withdrawal" || transaction.status !== "pending") {
      return NextResponse.json({ error: "Invalid transaction for this action" }, { status: 400 });
    }

    // 4. Process action (Atomic via RPC)
    const { error: rpcErr } = await adminClient.rpc('process_wallet_withdrawal_admin_action', {
      p_transaction_id: id,
      p_admin_id: user.id,
      p_action: action,
      p_admin_notes: adminNotes
    });

    if (rpcErr) throw rpcErr;

    // Log admin activity
    await adminClient.from("admin_activity_logs").insert({
      admin_id: user.id,
      target_id: id,
      target_type: "withdrawal",
      action_type: action === "approve" ? "approve_withdrawal" : "reject_withdrawal",
      metadata: { adminNotes }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Admin withdrawal processing error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
