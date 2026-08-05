import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role: "customer" | "admin";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "customer" | "admin";
    sessionVersion: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId?: string;
    role?: "customer" | "admin";
    sessionVersion?: number;
    invalid?: boolean;
    lastChecked?: number;
  }
}
