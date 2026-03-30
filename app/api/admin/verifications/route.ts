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

    const { data: profile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileFetchError || !isAdmin(user, profile)) {
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

    const updatePayload: {
      status: 'approved' | 'rejected';
      rejection_reason: string | null;
      reviewed_by: string;
      reviewed_at: string;
    } = {
      status,
      rejection_reason: status === 'rejected' ? rejectionReason || 'No reason provided.' : null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    };

    const { data: verification, error: verificationError } = await supabaseAdmin
      .from('seller_verifications')
      .update(updatePayload)
      .eq('id', verificationId)
      .select('id, user_id')
      .single();

    if (verificationError || !verification) {
      throw verificationError || new Error('Verification not found');
    }

    const [sellerProfileResult, sellerAuthResult] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('username')
        .eq('id', verification.user_id)
        .single(),
      supabaseAdmin.auth.admin.getUserById(verification.user_id),
    ]);

    if (sellerProfileResult.error) {
      console.error('Error fetching seller profile:', sellerProfileResult.error);
    }

    if (sellerAuthResult.error) {
      console.error('Error fetching seller auth data:', sellerAuthResult.error);
    }

    const sellerUsername = sellerProfileResult.data?.username || 'User';
    const sellerEmail = sellerAuthResult.data?.user?.email || null;

    const { error: verifiedUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({ is_verified_seller: status === 'approved' })
      .eq('id', verification.user_id);

    if (verifiedUpdateError) {
      throw verifiedUpdateError;
    }

    const statusText = status === 'approved' ? 'Approved' : 'Rejected';
    const notificationTitle = `Seller Verification ${statusText}`;
    const notificationContent =
      status === 'approved'
        ? 'Congratulations! Your seller verification application has been approved. You can now list items for sale.'
        : `Your seller verification application has been rejected. Reason: ${
            rejectionReason || 'No reason provided.'
          }`;

    const rawAppUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://rsplatform.com';

    const appUrl = rawAppUrl.replace(/\/+$/, '');
    const verifyUrl = `${appUrl}/sell/verify`;

    const { error: notificationError } = await supabaseAdmin.from('notifications').insert({
      user_id: verification.user_id,
      type: 'system',
      title: notificationTitle,
      content: notificationContent,
      link: '/sell/verify',
    });

    if (notificationError) {
      console.error('Failed to create in-app notification:', notificationError);
    }

    if (sellerEmail && resend) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #fafafa; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 32px;">
            <h1 style="color: #18181b; text-transform: uppercase; font-size: 24px; margin: 0 0 20px 0;">
              ${notificationTitle}
            </h1>

            <p style="color: #52525b; font-size: 16px; line-height: 1.5; margin: 0 0 16px 0;">
              Hello ${sellerUsername},
            </p>

            <p style="color: #52525b; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
              ${notificationContent}
            </p>

            <div style="margin-top: 32px;">
              <a
                href="${verifyUrl}"
                style="display: inline-block; background-color: #f59e0b; color: #18181b; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; text-transform: uppercase; font-size: 14px;"
              >
                View Status
              </a>
            </div>
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
      } catch (emailError) {
        console.error('Failed to send verification status email:', emailError);
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