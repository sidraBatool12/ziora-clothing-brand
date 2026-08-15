import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { brandEmailTemplate, escapeHtml, formatPkr } from "@/lib/email/template";

function emailCredentials() {
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || "").trim().replace(/\s+/g, "");
  return { user, pass };
}

let transporter: Transporter | null = null;

function getTransporter() {
  const { user, pass } = emailCredentials();
  if (!user || !pass) {
    throw new Error("EMAIL_NOT_CONFIGURED");
  }

  const key = `${user}:${pass}`;
  if (transporter && (transporter as { __key?: string }).__key === key) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 20_000,
  });
  (transporter as { __key?: string }).__key = key;
  return transporter;
}

export function storeInbox() {
  return (process.env.EMAIL_USER || "zioracollections137@gmail.com").trim();
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  extra?: { replyTo?: string }
) {
  const { user } = emailCredentials();
  const transport = getTransporter();
  return transport.sendMail({
    from: `"ZIORA" <${user}>`,
    to,
    subject,
    html,
    replyTo: extra?.replyTo,
  });
}

type Person = { email: string; name?: string };
type OrderMail = Person & { orderNumber: string; total?: number; trackingNumber?: string };

/* ---------- Customer ---------- */

export async function sendCustomerRegisteredEmail(to: string, name?: string) {
  const html = brandEmailTemplate({
    heading: "Welcome to ZIORA",
    intro: `Hi ${name || "there"}, your account has been created successfully.`,
    note: "Verify your email to start shopping modest luxury from ZIORA.",
  });
  await sendEmail(to, "Your ZIORA account is ready", html);
}

export async function sendEmailVerifiedEmail(to: string, name?: string) {
  const html = brandEmailTemplate({
    heading: "Email verified",
    intro: `Hi ${name || "there"}, your email has been verified. You can now sign in and shop.`,
    note: "If you did not create this account, please contact ZIORA support.",
  });
  await sendEmail(to, "Your ZIORA email is verified", html);
}

export async function sendOtpEmail(to: string, otp: string, purpose: "verify" | "reset") {
  const heading = purpose === "verify" ? "Verify your email" : "Reset your password";
  const html = brandEmailTemplate({
    heading,
    intro: `Your verification code is ${otp}.`,
    details: [{ label: "Code", value: otp }],
    note: `Expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. If you didn't request this, you can ignore this email.`,
  });
  await sendEmail(to, `${otp} is your ZIORA verification code`, html);
}

export async function sendPasswordResetSuccessEmail(to: string, name?: string) {
  const html = brandEmailTemplate({
    heading: "Password updated",
    intro: `Hi ${name || "there"}, your ZIORA password was reset successfully.`,
    note: "If you did not do this, contact support immediately.",
  });
  await sendEmail(to, "Your ZIORA password was reset", html);
}

export async function sendOrderPlacedEmail(input: OrderMail) {
  const html = brandEmailTemplate({
    heading: "Order placed",
    intro: `Thank you${input.name ? `, ${input.name}` : ""}. We have received your order and will confirm it shortly.`,
    details: [
      { label: "Order", value: input.orderNumber },
      ...(input.total != null ? [{ label: "Total", value: formatPkr(input.total) }] : []),
    ],
    note: "Track your order any time from your ZIORA dashboard.",
  });
  await sendEmail(input.email, `Your ZIORA order ${input.orderNumber} has been placed`, html);
}

export async function sendOrderConfirmedEmail(input: OrderMail) {
  const html = brandEmailTemplate({
    heading: "Order confirmed",
    intro: "Your order has been confirmed and is being prepared.",
    details: [
      { label: "Order", value: input.orderNumber },
      ...(input.total != null ? [{ label: "Total", value: formatPkr(input.total) }] : []),
    ],
    note: "We will email you again when it ships.",
  });
  await sendEmail(input.email, `Your ZIORA order ${input.orderNumber} is confirmed`, html);
}

export async function sendOrderShippedEmail(input: OrderMail) {
  const html = brandEmailTemplate({
    heading: "Order shipped",
    intro: "Your order is on its way.",
    details: [
      { label: "Order", value: input.orderNumber },
      ...(input.trackingNumber ? [{ label: "Tracking", value: input.trackingNumber }] : []),
    ],
  });
  await sendEmail(input.email, `Your ZIORA order ${input.orderNumber} has shipped`, html);
}

export async function sendOrderOutForDeliveryEmail(input: OrderMail) {
  const html = brandEmailTemplate({
    heading: "Out for delivery",
    intro: "Your order is out for delivery and should arrive soon.",
    details: [
      { label: "Order", value: input.orderNumber },
      ...(input.trackingNumber ? [{ label: "Tracking", value: input.trackingNumber }] : []),
    ],
  });
  await sendEmail(input.email, `Your ZIORA order ${input.orderNumber} is out for delivery`, html);
}

export async function sendOrderDeliveredEmail(input: OrderMail) {
  const html = brandEmailTemplate({
    heading: "Order delivered",
    intro: "Your order has been delivered. We hope you love your ZIORA pieces.",
    details: [{ label: "Order", value: input.orderNumber }],
    note: "You can share a review from your dashboard once you have tried them on.",
  });
  await sendEmail(input.email, `Your ZIORA order ${input.orderNumber} was delivered`, html);
}

export async function sendOrderCancelledEmail(input: OrderMail) {
  const html = brandEmailTemplate({
    heading: "Order cancelled",
    intro: "Your order has been cancelled.",
    details: [
      { label: "Order", value: input.orderNumber },
      ...(input.total != null ? [{ label: "Total", value: formatPkr(input.total) }] : []),
    ],
    note: "If this was unexpected, reply to this email or contact ZIORA support.",
  });
  await sendEmail(input.email, `Your ZIORA order ${input.orderNumber} was cancelled`, html);
}

export async function sendPaymentReceivedEmail(input: OrderMail) {
  const html = brandEmailTemplate({
    heading: "Payment received",
    intro: "We have received and verified your payment. Thank you.",
    details: [
      { label: "Order", value: input.orderNumber },
      ...(input.total != null ? [{ label: "Total", value: formatPkr(input.total) }] : []),
    ],
  });
  await sendEmail(input.email, `Payment received for ZIORA order ${input.orderNumber}`, html);
}

/** @deprecated Use sendOrderPlacedEmail */
export async function sendOrderConfirmationEmail(to: string, orderNumber: string, total: number) {
  await sendOrderPlacedEmail({ email: to, orderNumber, total });
}

export async function sendPaymentStatusEmail(
  to: string,
  orderNumber: string,
  status: "paid" | "rejected" | "refunded"
) {
  if (status === "paid") {
    await sendPaymentReceivedEmail({ email: to, orderNumber });
    return;
  }
  const html = brandEmailTemplate({
    heading: status === "refunded" ? "Payment refunded" : "Payment not verified",
    intro:
      status === "refunded"
        ? "Your payment has been refunded."
        : "We could not verify your payment. Please contact support or resubmit proof.",
    details: [{ label: "Order", value: orderNumber }],
  });
  await sendEmail(to, `Payment update for ZIORA order ${orderNumber}`, html);
}

export async function sendShippingUpdateEmail(
  to: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string
) {
  const payload = { email: to, orderNumber, trackingNumber };
  if (status === "confirmed") return sendOrderConfirmedEmail(payload);
  if (status === "shipped") return sendOrderShippedEmail(payload);
  if (status === "out_for_delivery") return sendOrderOutForDeliveryEmail(payload);
  if (status === "delivered") return sendOrderDeliveredEmail(payload);
  if (status === "cancelled") return sendOrderCancelledEmail(payload);
}

/* ---------- Admin ---------- */

export async function sendAdminNewCustomerEmail(input: Person) {
  const html = brandEmailTemplate({
    heading: "New customer registered",
    intro: "A new customer just created a ZIORA account.",
    details: [
      { label: "Name", value: input.name || "Customer" },
      { label: "Email", value: input.email },
    ],
  });
  await sendEmail(storeInbox(), `New ZIORA customer: ${input.email}`, html, { replyTo: input.email });
}

export async function sendAdminNewOrderEmail(input: {
  orderNumber: string;
  total: number;
  customerEmail: string;
  customerName?: string;
}) {
  const html = brandEmailTemplate({
    heading: "New order received",
    intro: "A customer just placed an order on ZIORA.",
    details: [
      { label: "Order", value: input.orderNumber },
      { label: "Total", value: formatPkr(input.total) },
      { label: "Customer", value: `${input.customerName || "Customer"} (${input.customerEmail})` },
    ],
    note: "Open the admin orders panel to process this order.",
  });
  await sendEmail(storeInbox(), `New ZIORA order ${input.orderNumber}`, html, {
    replyTo: input.customerEmail,
  });
}

export async function sendNewOrderStoreEmail(input: {
  orderNumber: string;
  total: number;
  customerEmail: string;
  customerName?: string;
}) {
  await sendAdminNewOrderEmail(input);
}

export async function sendAdminOrderCancelledEmail(input: {
  orderNumber: string;
  total?: number;
  customerEmail?: string;
  customerName?: string;
}) {
  const html = brandEmailTemplate({
    heading: "Order cancelled",
    intro: "An order has been cancelled.",
    details: [
      { label: "Order", value: input.orderNumber },
      ...(input.total != null ? [{ label: "Total", value: formatPkr(input.total) }] : []),
      ...(input.customerEmail
        ? [{ label: "Customer", value: `${input.customerName || "Customer"} (${input.customerEmail})` }]
        : []),
    ],
  });
  await sendEmail(storeInbox(), `ZIORA order cancelled: ${input.orderNumber}`, html);
}

export async function sendLowStockAlertEmail(input: { name: string; sku?: string; stockQuantity: number }) {
  const html = brandEmailTemplate({
    heading: "Low stock alert",
    intro: "A product is running low and may sell out soon.",
    details: [
      { label: "Product", value: input.name },
      ...(input.sku ? [{ label: "SKU", value: input.sku }] : []),
      { label: "Remaining", value: String(input.stockQuantity) },
    ],
  });
  await sendEmail(storeInbox(), `Low stock: ${input.name}`, html);
}

export async function sendOutOfStockAlertEmail(input: { name: string; sku?: string }) {
  const html = brandEmailTemplate({
    heading: "Out of stock",
    intro: "A product has reached zero stock.",
    details: [
      { label: "Product", value: input.name },
      ...(input.sku ? [{ label: "SKU", value: input.sku }] : []),
    ],
    note: "Restock this piece in the admin catalog when inventory arrives.",
  });
  await sendEmail(storeInbox(), `Out of stock: ${input.name}`, html);
}

export async function sendContactNotificationEmail(input: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const topic = input.subject?.trim() || "New website message";
  const html = brandEmailTemplate({
    heading: "New contact message",
    intro: "Someone sent a note from the ZIORA contact form.",
    details: [
      { label: "Name", value: input.name },
      { label: "Email", value: input.email },
      { label: "Subject", value: topic },
      { label: "Message", value: input.message },
    ],
    note: "Reply directly to this email to reach the customer.",
  });
  await sendEmail(storeInbox(), `ZIORA contact: ${topic}`, html, { replyTo: input.email });
}

export { escapeHtml };
