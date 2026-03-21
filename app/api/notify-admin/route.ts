import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not set. Skipping notification.');
      return NextResponse.json({ success: false, error: 'RESEND_API_KEY not configured' });
    }

    const resend = new Resend(apiKey);
    const { type, userId, email } = await request.json();

    if (type === 'seller_verification') {
      await resend.emails.send({
        from: 'RSPlatform <notifications@rsplatform.gg>',
        to: 'skillerway100@gmail.com',
        subject: 'New seller verification submitted',
        text: `A new seller verification request has been submitted on RSPlatform by user ${email} (ID: ${userId}) and is ready for review.`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    // We don't want to fail the whole process if email fails, but we log it
    return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 });
  }
}
