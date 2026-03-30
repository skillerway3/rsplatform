import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const { type, userId, email, subject, message, name } = await request.json();

    let inAppNotificationCreated = false;
    let emailSent = false;
    const emailSkipped = !apiKey;

    // 1. Create in-app notification for admin (Primary)
    try {
      const supabaseAdmin = getSupabaseAdmin();

      // Find admin users
      const { data: admins } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const adminNotifications = admins.map(admin => ({
          user_id: admin.id,
          type: 'system',
          title: type === 'seller_verification' ? 'New Seller Verification' : 'New Admin Notification',
          content: type === 'seller_verification' 
            ? `User ${email} has submitted a verification request.` 
            : `New ${type} from ${email}`,
          link: type === 'seller_verification' ? '/admin/verifications' : undefined
        }));

        const { error: dbError } = await supabaseAdmin.from('notifications').insert(adminNotifications);
        if (dbError) throw dbError;
        inAppNotificationCreated = true;
      } else {
        // No admins found
        return NextResponse.json({ 
          success: false, 
          inAppNotificationCreated: false,
          emailSent: false,
          emailSkipped,
          error: 'No admin profiles found' 
        }, { status: 404 });
      }
    } catch (notifyErr) {
      console.error('Error creating in-app admin notification:', notifyErr);
      return NextResponse.json({ 
        success: false, 
        inAppNotificationCreated: false,
        emailSent: false,
        emailSkipped,
        error: 'Failed to create in-app notification' 
      }, { status: 500 });
    }

    // 2. Send Email (Best effort)
    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        if (type === 'seller_verification') {
          await resend.emails.send({
            from: 'RSPlatform <notifications@rsplatform.gg>',
            to: 'skillerway100@gmail.com',
            subject: 'New seller verification submitted',
            text: `A new seller verification request has been submitted on RSPlatform by user ${email} (ID: ${userId}) and is ready for review.`,
          });
        } else if (type === 'support_ticket') {
          await resend.emails.send({
            from: 'RSPlatform Support <support@rsplatform.gg>',
            to: 'admin@rsplatform.gg',
            subject: `Support Ticket: ${subject || 'No Subject'}`,
            text: `New support ticket from ${name || 'Unknown'} (${email}):\n\nSubject: ${subject}\n\nMessage:\n${message}`,
          });
        } else if (type === 'live_agent_request') {
          await resend.emails.send({
            from: 'RSPlatform Support <support@rsplatform.gg>',
            to: 'admin@rsplatform.gg',
            subject: 'Live Agent Request',
            text: `A user is requesting a live agent.\n\nUser: ${name || 'Guest'} (${email || 'No email'})\nCategory: ${subject}\nTopic: ${message}`,
          });
        }
        emailSent = true;
      } catch (emailErr) {
        console.error('Failed to send admin email:', emailErr);
        // We don't fail the request, but emailSent remains false
      }
    } else {
      console.warn('RESEND_API_KEY is not set. Skipping email notification.');
    }

    return NextResponse.json({ 
      success: true,
      inAppNotificationCreated,
      emailSent,
      emailSkipped
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    // We don't want to fail the whole process if email fails, but we log it
    return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 });
  }
}
