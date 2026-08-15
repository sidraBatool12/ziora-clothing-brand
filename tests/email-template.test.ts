import { describe, expect, it } from "vitest";
import { brandEmailTemplate, escapeHtml, formatPkr } from "@/lib/email/template";

describe("email templates", () => {
  it("escapes HTML in customer-provided text", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
  });

  it("renders a reusable branded layout", () => {
    const html = brandEmailTemplate({
      heading: "Order placed",
      intro: "We received your order.",
      details: [{ label: "Order", value: "ZR-1001" }],
      note: "Track it in your dashboard.",
    });
    expect(html).toContain("ZIORA");
    expect(html).toContain("Grace Beyond Modesty");
    expect(html).toContain("Order placed");
    expect(html).toContain("ZR-1001");
  });

  it("formats PKR totals", () => {
    expect(formatPkr(2500)).toContain("2,500");
  });
});
