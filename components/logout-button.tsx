"use client";

import { signOut } from "next-auth/react";

export function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={className}
    >
      Logout
    </button>
  );
}
