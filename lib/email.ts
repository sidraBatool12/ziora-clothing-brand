import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // swap for your real SMTP provider in production
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendEmail(to: string, subject: string, html: string) {
  return transporter.sendMail({ from: `"ZIORA" <${process.env.EMAIL_USER}>`, to, subject, html });
}

const shell = (body: string) => `
  <div style="font-family: Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background:#0F0F0F; color:#F8F5F0; padding: 32px;">
    <p style="font-family: Georgia, serif; letter-spacing: 0.2em; text-transform: uppercase; font-size: 20px; margin-bottom: 4px; color:#fff;">ZIORA</p>
    <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color:#D4AF37; margin-top:0;">Grace Beyond Modesty</p>
    <div style="height:1px; background:#D4AF37; opacity:0.4; margin: 16px 0;"></div>
    ${body}
  </div>
`;

export async function sendOtpEmail(to: string, otp: string, purpose: "verify" | "reset") {
  const heading = purpose === "verify" ? "Verify your email" : "Reset your password";
  const html = shell(`
    <h2 style="font-size:18px; color:#fff;">${heading}</h2>
    <p style="color:#ccc;">Your verification code is:</p>
    <p style="font-size: 32px; letter-spacing: 0.2em; font-weight: 600; color:#D4AF37;">${otp}</p>
    <p style="font-size: 13px; color:#888;">Expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. If you didn't request this, you can ignore this email.</p>
  `);
  await sendEmail(to, `${otp} is your ZIORA verification code`, html);
}

export async function sendOrderConfirmationEmail(to: string, orderNumber: string, total: number) {
  const html = shell(`
    <h2 style="font-size:18px; color:#fff;">Order Confirmed</h2>
    <p style="color:#ccc;">Thank you for your order. Your order number is:</p>
    <p style="font-size: 20px; font-weight: 600; color:#D4AF37;">${orderNumber}</p>
    <p style="color:#ccc;">Total: <strong style="color:#fff;">PKR ${total.toLocaleString()}</strong></p>
    <p style="font-size: 13px; color:#888;">Track your order any time from your ZIORA dashboard.</p>
  `);
  await sendEmail(to, `Your ZIORA order ${orderNumber} is confirmed`, html);
}

export async function sendShippingUpdateEmail(to: string, orderNumber: string, status: string, trackingNumber?: string) {
  const html = shell(`
    <h2 style="font-size:18px; color:#fff;">Shipping Update</h2>
    <p style="color:#ccc;">Your order <strong style="color:#D4AF37;">${orderNumber}</strong> is now:</p>
    <p style="font-size: 20px; font-weight: 600; color:#fff; text-transform:capitalize;">${status.replace(/_/g, " ")}</p>
    ${trackingNumber ? `<p style="color:#ccc;">Tracking number: <strong style="color:#D4AF37;">${trackingNumber}</strong></p>` : ""}
  `);
  await sendEmail(to, `Update on your ZIORA order ${orderNumber}`, html);
}

export async function sendPaymentStatusEmail(to: string, orderNumber: string, status: "paid" | "rejected" | "refunded") {
  const messages: Record<string, string> = {
    paid: "Your payment has been verified and confirmed.",
    rejected: "We couldn't verify your payment. Please contact support or resubmit proof.",
    refunded: "Your payment has been refunded.",
  };
  const html = shell(`
    <h2 style="font-size:18px; color:#fff;">Payment Update</h2>
    <p style="color:#ccc;">Order <strong style="color:#D4AF37;">${orderNumber}</strong>:</p>
    <p style="color:#fff;">${messages[status]}</p>
  `);
  await sendEmail(to, `Payment update for ZIORA order ${orderNumber}`, html);
}
