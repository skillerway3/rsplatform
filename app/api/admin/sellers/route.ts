import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdmin } from '@/lib/utils';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type RequestBody = {
  verificationId?: string;
  status?: 'approved' | 'rejected';
  rejectionReason?: string | null;
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !isAdmin(user, profile)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as RequestBody;
    const verificationId = body.verificationId;
    const status = body.status;
    const rejectionReason =
      typeof body.rejectionReason === 'string' ? body.rejectionReason.trim() : null;

    if (!verificationId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: verification, error: verificationError } = await supabaseAdmin
      .from('seller_verifications')
      .update({
        status,
        rejection_reason: status === 'rejected' ? rejectionReason || 'No reason provided.' : null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', verificationId)
      .select('id, user_id')
      .single();

    if (verificationError || !verification) {
      throw verificationError || new Error('Verification not found');
    }

    const { data: sellerData, error: sellerError } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('id', verification.user_id)
      .single();

    if (sellerError) {
      console.error('Error fetching seller data:', sellerError);
    }

    const { data: authData, error: authError2 } =
      await supabaseAdmin.auth.admin.getUserById(verification.user_id);

    if (authError2) {
      console.error('Error fetching seller auth data:', authError2);
    }

    const sellerUsername = sellerData?.username || 'Seller';
    const sellerEmail = authData?.user?.email || null;

    const { error: verifiedProfileError } = await supabaseAdmin
      .from('profiles')
      .update({ is_verified_seller: status === 'approved' })
      .eq('id', verification.user_id);

    if (verifiedProfileError) {
      throw verifiedProfileError;
    }

    const statusText = status === 'approved' ? 'Approved' : 'Rejected';
    const notificationTitle = `Seller Verification ${statusText}`;
    const notificationContent =
      status === 'approved'
        ? 'Congratulations! Your seller verification application has been approved. You can now list items for sale.'
        : `Your seller verification application has been rejected. Reason: ${
            rejectionReason || 'No reason provided.'
          }`;

    await supabaseAdmin.from('notifications').insert({
      user_id: verification.user_id,
      type: 'system',
      title: notificationTitle,
      content: notificationContent,
      link: '/sell/verify',
    });

    if (sellerEmail && resend) {
      const appUrl = (
        process.env.NEXT_PUBLIC_APP_URL || 'https://rsplatform.com'
      ).replace(/\/+$/, '');

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #18181b; text-transform: uppercase;">${notificationTitle}</h1>
          <p style="color: #52525b; font-size: 16px; line-height: 1.5;">
            Hello ${sellerUsername},
          </p>
          <p style="color: #52525b; font-size: 16px; line-height: 1.5;">
            ${notificationContent}
          </p>
          <div style="margin-top: 32px;">
            <a
              href="${appUrl}/sell/verify"
              style="background-color: #f59e0b; color: #18181b; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; text-transform: uppercase; font-size: 14px; display: inline-block;"
            >
              View Status
            </a>
          </div>
        </div>
      `;

      try {
        await resend.emails.send({
          from: 'RSPlatform <noreply@rsplatform.com>',
          to: sellerEmail,
          subject: notificationTitle,
          html: emailHtml,
        });
      } catch (emailErr) {
        console.error('Failed to send verification status email:', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Internal server error');
    console.error('Admin verifications API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}