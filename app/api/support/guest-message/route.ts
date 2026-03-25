import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { threadId, guestSessionId, content } = await req.json();

    if (!threadId || !guestSessionId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Verify thread exists and matches guestSessionId
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('support_threads')
      .select('id, user_id, guest_session_id')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    if (thread.user_id !== null || thread.guest_session_id !== guestSessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Insert message
    const { data: message, error: messageError } = await supabaseAdmin
      .from('support_messages')
      .insert({
        thread_id: threadId,
        sender_id: null,
        sender_type: 'user',
        content,
        is_read: false
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Update thread last_message_at
    await supabaseAdmin
      .from('support_threads')
      .update({ last_message_at: new Date().toISOString(), status: 'open' })
      .eq('id', threadId);

    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    console.error('Guest message API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
