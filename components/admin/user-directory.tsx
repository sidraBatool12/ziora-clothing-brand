"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass, UserList } from "@phosphor-icons/react";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

interface DirectoryUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "customer" | "admin";
  isVerified: boolean;
  providers: string[];
  lastLoginAt?: string;
  createdAt: string;
}

export function UserDirectory({ users }: { users: DirectoryUser[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return users.filter((user) => {
      const matches =
        !search ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search);
      const statusMatches =
        filter === "all" ||
        user.role === filter ||
        (filter === "verified" && user.isVerified) ||
        (filter === "unverified" && !user.isVerified);
      return matches && statusMatches;
    });
  }, [filter, query, users]);

  return (
    <section>
      <div className="flex flex-col gap-3 border-y border-onyx/[0.07] py-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <MagnifyingGlass size={17} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-onyx/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email or phone"
            className="w-full rounded-full bg-white py-3 pl-10 pr-4 text-sm outline-none ring-1 ring-inset ring-onyx/[0.08] placeholder:text-onyx/30 focus:ring-rose/45"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {[
            ["all", "All"],
            ["customer", "Customers"],
            ["admin", "Admins"],
            ["verified", "Verified"],
            ["unverified", "Unverified"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-[10px] uppercase tracking-[0.12em] transition-all active:scale-[0.98]",
                filter === value ? "bg-onyx text-white" : "bg-white text-onyx/50 ring-1 ring-inset ring-onyx/[0.07]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center text-center">
          <UserList size={25} weight="light" className="text-onyx/28" />
          <p className="mt-4 text-sm font-medium">No users found</p>
          <p className="mt-1 text-xs text-onyx/38">Try another search or status filter.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-onyx/[0.07] text-left text-[9px] uppercase tracking-[0.16em] text-onyx/35">
                <th className="px-2 py-3 font-medium">User</th>
                <th className="px-2 py-3 font-medium">Contact</th>
                <th className="px-2 py-3 font-medium">Access</th>
                <th className="px-2 py-3 font-medium">Authentication</th>
                <th className="px-2 py-3 font-medium">Last active</th>
                <th className="px-2 py-3 text-right font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-onyx/[0.06]">
              {filtered.map((user) => (
                <tr key={user._id} className="transition-colors hover:bg-white/55">
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.name} image={user.avatar} size={38} />
                      <div className="min-w-0">
                        <p className="max-w-[14rem] truncate text-sm font-medium">{user.name}</p>
                        <p className="text-[10px] text-onyx/35">ID · {user._id.slice(-7).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-4">
                    <p className="text-xs text-onyx/70">{user.email}</p>
                    <p className="mt-0.5 text-[10px] text-onyx/35">{user.phone || "No phone added"}</p>
                  </td>
                  <td className="px-2 py-4">
                    <span className={cn(
                      "rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.12em]",
                      user.role === "admin" ? "bg-rose/10 text-rose" : "bg-onyx/[0.055] text-onyx/50"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 rounded-full", user.isVerified ? "bg-emerald-600" : "bg-amber-500")} />
                      <span className="text-xs text-onyx/60">{user.isVerified ? "Verified" : "Pending"}</span>
                    </div>
                    <p className="mt-1 text-[10px] capitalize text-onyx/33">
                      {user.providers?.join(" + ") || "Credentials"}
                    </p>
                  </td>
                  <td className="px-2 py-4 text-xs text-onyx/50">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                  </td>
                  <td className="px-2 py-4 text-right text-xs text-onyx/50">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
