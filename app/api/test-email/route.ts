import nodemailer from "nodemailer";

export async function GET() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: "skillerway100@gmail.com",
    subject: "SMTP Working ✅",
    text: "Email system works!",
  });

  return Response.json({ success: true });
}
