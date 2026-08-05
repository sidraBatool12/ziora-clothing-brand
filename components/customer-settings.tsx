"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

const labelClass = "mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-onyx/45";

type SettingsState = {
  darkMode: boolean;
  notifications: boolean;
  language: string;
};

const DEFAULT_SETTINGS: SettingsState = {
  darkMode: false,
  notifications: true,
  language: "en",
};

export function CustomerSettingsPanel() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ziora-customer-settings");
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      // ignore malformed local settings
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
    localStorage.setItem("ziora-customer-settings", JSON.stringify(settings));
  }, [settings]);

  async function deleteAccount() {
    const confirmed = window.confirm("Delete your account permanently? This cannot be undone.");
    if (!confirmed) return;

    setError(null);
    const res = await fetch("/api/account/profile", { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not delete account.");
      return;
    }
    await signOut({ callbackUrl: "/signup" });
  }

  return (
    <div className="max-w-xl space-y-8">
      <div className="space-y-4 border border-onyx/10 bg-white p-6">
        <h2 className="text-lg text-onyx">Preferences</h2>
        <label className="flex items-center justify-between gap-4 text-sm">
          <span>Dark mode</span>
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={(e) => setSettings((prev) => ({ ...prev, darkMode: e.target.checked }))}
          />
        </label>
        <label className="flex items-center justify-between gap-4 text-sm">
          <span>Order & promo notifications</span>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => setSettings((prev) => ({ ...prev, notifications: e.target.checked }))}
          />
        </label>
        <div>
          <label className={labelClass}>Language</label>
          <select
            value={settings.language}
            onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
            className="w-full border border-onyx/10 bg-white px-4 py-3 text-sm"
          >
            <option value="en">English</option>
            <option value="ur">Urdu</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => setMessage("Preferences saved on this device.")}
          className="rounded-full bg-onyx px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white"
        >
          Save preferences
        </button>
        {message && <p className="text-sm text-emerald-700">{message}</p>}
      </div>

      <div className="space-y-4 border border-red-200 bg-white p-6">
        <h2 className="text-lg text-onyx">Danger zone</h2>
        <p className="text-sm text-onyx/60">Deleting your account removes your profile and addresses.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={deleteAccount}
            className="rounded-full border border-red-500 px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-red-600"
          >
            Delete account
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-full border border-onyx/20 px-6 py-3 text-[11px] uppercase tracking-[0.18em]"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
