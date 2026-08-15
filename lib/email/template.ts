export type EmailDetail = { label: string; value: string };

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function brandEmailTemplate(input: {
  heading: string;
  intro?: string;
  details?: EmailDetail[];
  note?: string;
}) {
  const details = (input.details || [])
    .map(
      (row) =>
        `<p style="color:#ccc;margin:8px 0;"><strong style="color:#fff;">${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}</p>`
    )
    .join("");

  return `
  <div style="font-family: Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background:#0F0F0F; color:#F8F5F0; padding: 32px;">
    <p style="font-family: Georgia, serif; letter-spacing: 0.2em; text-transform: uppercase; font-size: 20px; margin-bottom: 4px; color:#fff;">ZIORA</p>
    <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color:#D4AF37; margin-top:0;">Grace Beyond Modesty</p>
    <div style="height:1px; background:#D4AF37; opacity:0.4; margin: 16px 0;"></div>
    <h2 style="font-size:18px; color:#fff; margin:0 0 12px;">${escapeHtml(input.heading)}</h2>
    ${input.intro ? `<p style="color:#ccc;line-height:1.6;">${escapeHtml(input.intro)}</p>` : ""}
    ${details}
    ${input.note ? `<p style="font-size:13px;color:#888;margin-top:16px;">${escapeHtml(input.note)}</p>` : ""}
  </div>
`;
}

export function formatPkr(amount: number) {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}
