"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { UserAvatar } from "@/components/user-avatar";

const inputClass = "w-full border border-onyx/10 bg-white px-4 py-3 text-sm outline-none transition-colors focus-visible:border-rose";
const labelClass = "mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-onyx/45";
const btnClass = "rounded-full bg-onyx px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-onyx/90 disabled:opacity-50";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  providers: string[];
};

export function ProfileEditor() {
  const router = useRouter();
  const { update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/account/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
          setName(data.user.name);
          setEmail(data.user.email);
          setPhone(data.user.phone || "");
        }
      })
      .catch(() => setError("Failed to load profile."));
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Could not save profile.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setMessage("Profile updated.");
    await update();
    router.refresh();
  }

  async function onAvatarChange(file: File | null) {
    if (!file) return;
    setError(null);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: reader.result }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Avatar upload failed.");
        return;
      }
      setProfile((prev) => (prev ? { ...prev, avatar: data.avatar } : prev));
      setMessage("Avatar updated.");
      await update();
      router.refresh();
    };
    reader.readAsDataURL(file);
  }

  if (!profile) {
    return <p className="text-sm text-onyx/55">{error || "Loading profile…"}</p>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <div className="space-y-4">
        <UserAvatar name={name} image={profile.avatar} size={96} />
        <label className="inline-block cursor-pointer text-[11px] uppercase tracking-[0.16em] text-gold underline">
          Upload photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onAvatarChange(e.target.files?.[0] || null)}
          />
        </label>
        <div className="space-y-1 text-xs text-onyx/50">
          <p>Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
          {profile.lastLoginAt && <p>Last login {new Date(profile.lastLoginAt).toLocaleString()}</p>}
        </div>
      </div>

      <form onSubmit={onSave} className="max-w-xl space-y-5">
        <div>
          <label className={labelClass}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
        {profile.providers.includes("credentials") && (
          <>
            <div>
              <label className={labelClass}>Current password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>New password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} minLength={8} />
            </div>
          </>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-emerald-700">{message}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className={btnClass}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-full border border-onyx/20 px-6 py-3 text-[11px] uppercase tracking-[0.18em]"
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  );
}
