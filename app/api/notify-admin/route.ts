import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error('RESEND_API_KEY is missing');
      return NextResponse.json(
        { success: false, error: 'RESEND_API_KEY not configured' },
        { status: 500 }
      );
    }

    const { type, userId, email } = await request.json();

    if (type !== 'seller_verification') {
      return NextResponse.json({ success: true });
    }

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: 'RSPlatform <notifications@rsplatform.gg>',
      to: 'skillerway100@gmail.com',
      subject: 'New seller verification submitted',
      text: `A new seller verification request has been submitted on RSPlatform by ${email} (User ID: ${userId}).`,
    });

    console.log('Admin notification sent:', result);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}