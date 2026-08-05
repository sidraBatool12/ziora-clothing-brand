"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, EnvelopeOpen, MagnifyingGlass, SpinnerGap } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface Message {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "unread" | "read" | "resolved";
  adminNote?: string;
  createdAt: string;
}

export function ContactInbox({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(messages[0]?._id || null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return messages.filter((message) => {
      const matches =
        !search ||
        message.name.toLowerCase().includes(search) ||
        message.email.toLowerCase().includes(search) ||
        message.subject?.toLowerCase().includes(search) ||
        message.message.toLowerCase().includes(search);
      return matches && (filter === "all" || message.status === filter);
    });
  }, [filter, messages, query]);

  const selected = filtered.find((message) => message._id === selectedId) || filtered[0];

  async function update(message: Message, status: Message["status"]) {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/admin/contacts/${message._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        adminNote: notes[message._id] ?? message.adminNote ?? "",
      }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error || "Message could not be updated.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-col gap-3 border-y border-onyx/[0.07] py-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <MagnifyingGlass size={17} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-onyx/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search messages"
            className="w-full rounded-full bg-white py-3 pl-10 pr-4 text-sm outline-none ring-1 ring-inset ring-onyx/[0.08] placeholder:text-onyx/30 focus:ring-rose/45"
          />
        </div>
        <div className="flex gap-1">
          {["all", "unread", "read", "resolved"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full px-3.5 py-2 text-[10px] capitalize transition-all active:scale-[0.98]",
                filter === value ? "bg-onyx text-white" : "bg-white text-onyx/50 ring-1 ring-inset ring-onyx/[0.07]"
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-rose/[0.07] px-4 py-3 text-sm text-rose">{error}</p>}

      {filtered.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center text-center">
          <EnvelopeOpen size={25} weight="light" className="text-onyx/28" />
          <p className="mt-4 text-sm font-medium">Inbox is clear</p>
          <p className="mt-1 text-xs text-onyx/38">Storefront contact messages will appear here.</p>
        </div>
      ) : (
        <div className="mt-5 grid overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-inset ring-onyx/[0.07] lg:grid-cols-[0.78fr_1.22fr]">
          <div className="max-h-[42rem] overflow-y-auto border-b border-onyx/[0.07] lg:border-b-0 lg:border-r">
            {filtered.map((message) => (
              <button
                key={message._id}
                type="button"
                onClick={() => {
                  setSelectedId(message._id);
                  if (message.status === "unread") update(message, "read");
                }}
                className={cn(
                  "w-full border-b border-onyx/[0.06] px-4 py-4 text-left transition-colors last:border-b-0",
                  selected?._id === message._id ? "bg-[#F4F1EC]" : "hover:bg-ivory/65"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", message.status === "unread" ? "bg-rose" : "bg-onyx/15")} />
                  <span className="truncate text-xs font-medium">{message.name}</span>
                  <span className="ml-auto shrink-0 text-[9px] text-onyx/30">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 truncate pl-3.5 text-[11px] text-onyx/55">{message.subject || "General enquiry"}</p>
                <p className="mt-1 line-clamp-2 pl-3.5 text-[10px] leading-relaxed text-onyx/35">{message.message}</p>
              </button>
            ))}
          </div>

          {selected && (
            <article className="p-5 sm:p-7">
              <div className="flex flex-col gap-3 border-b border-onyx/[0.07] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.17em] text-rose">{selected.status}</p>
                  <h2 className="mt-2 text-xl font-medium tracking-tight">{selected.subject || "General enquiry"}</h2>
                  <p className="mt-1 text-xs text-onyx/42">
                    {selected.name} · <a href={`mailto:${selected.email}`} className="underline underline-offset-2">{selected.email}</a>
                  </p>
                </div>
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || "Your ZIORA enquiry"}`)}`}
                  className="rounded-full bg-onyx px-4 py-2.5 text-[10px] uppercase tracking-[0.12em] text-white active:scale-[0.98]"
                >
                  Reply by email
                </a>
              </div>
              <p className="whitespace-pre-wrap py-7 text-sm leading-7 text-onyx/68">{selected.message}</p>
              <div className="border-t border-onyx/[0.07] pt-5">
                <label className="space-y-2">
                  <span className="block text-[9px] uppercase tracking-[0.16em] text-onyx/35">Internal note</span>
                  <textarea
                    rows={4}
                    value={notes[selected._id] ?? selected.adminNote ?? ""}
                    onChange={(event) => setNotes((current) => ({ ...current, [selected._id]: event.target.value }))}
                    className="w-full resize-y rounded-xl bg-[#F7F5F1] p-3 text-xs leading-relaxed outline-none ring-1 ring-inset ring-onyx/[0.07] focus:ring-rose/40"
                    placeholder="Add context for the team..."
                  />
                </label>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => update(selected, selected.status === "unread" ? "read" : selected.status)}
                    className="rounded-full bg-white px-4 py-2.5 text-[10px] text-onyx/55 ring-1 ring-inset ring-onyx/[0.09] disabled:opacity-50"
                  >
                    Save note
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => update(selected, "resolved")}
                    className="flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2.5 text-[10px] text-white disabled:opacity-50"
                  >
                    {busy ? <SpinnerGap size={13} className="animate-spin" /> : <Check size={13} weight="bold" />}
                    Resolve
                  </button>
                </div>
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  );
}
