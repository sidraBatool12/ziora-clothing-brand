"use client";

import { useState } from "react";
import { ArrowRight, Check, SpinnerGap } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus("idle");
      setError(data.error || "Your message could not be sent.");
      return;
    }
    setStatus("sent");
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  if (status === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[28rem] flex-col items-start justify-center bg-white p-6 ring-1 ring-inset ring-onyx/10 md:p-10"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700/10 text-emerald-800">
          <Check size={22} weight="bold" />
        </span>
        <h2 className="mt-6 text-2xl tracking-tight">Message received</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-onyx/55">
          The ZIORA team will review your note and reply to the email address you provided.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-7 text-xs uppercase tracking-[0.16em] text-rose underline underline-offset-4"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form className="space-y-5 bg-white p-6 ring-1 ring-inset ring-onyx/10 md:p-10" onSubmit={submit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-onyx/45">Name</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="input-field"
          />
          <span className="block text-[11px] text-onyx/35">As it should appear on replies</span>
        </label>
        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-onyx/45">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="input-field"
          />
          <span className="block text-[11px] text-onyx/35">We never share your inbox</span>
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-onyx/45">Subject</span>
        <input
          type="text"
          value={form.subject}
          onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
          className="input-field"
          placeholder="Sizing, order or wholesale"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-onyx/45">Message</span>
        <textarea
          rows={6}
          required
          minLength={10}
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          className="input-field resize-y"
        />
        <span className="block text-[11px] text-onyx/35">Include order numbers if relevant</span>
      </label>
      {error && <p role="alert" className="text-sm text-rose">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="group flex items-center gap-4 rounded-full bg-onyx py-1.5 pl-6 pr-1.5 text-xs uppercase tracking-[0.15em] text-white transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        {status === "sending" ? "Sending" : "Send message"}
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
          {status === "sending" ? <SpinnerGap size={15} className="animate-spin" /> : <ArrowRight size={15} />}
        </span>
      </button>
    </form>
  );
}
