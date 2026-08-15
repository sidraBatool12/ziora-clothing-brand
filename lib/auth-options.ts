import type { NextAuthOptions } from "next-auth";
import type { Provider } from "next-auth/providers/index";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { evaluateCredentialLogin } from "@/lib/auth-result";
import { isGoogleConfigured } from "@/lib/provider-config";
import { sendAdminNewCustomerEmail, sendCustomerRegisteredEmail, sendEmailVerifiedEmail } from "@/lib/email";
import { notifyLater } from "@/lib/notify";

const credentialsSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

const sessionMaxAge = 60 * 60 * 24 * 30;
const profileRefreshSeconds = 60 * 60;

/** Compared against when no account exists, so response time doesn't leak existence. */
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEe.HqZjPeJmVMkQC0lVBqLmYVCVLZ0AqAu";

function resolveSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (secret) return secret;

  const legacy = process.env.JWT_SECRET;
  if (legacy) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXTAUTH_SECRET must be set in production.");
    }
    console.warn("[auth] NEXTAUTH_SECRET is not set — falling back to JWT_SECRET for development.");
    return legacy;
  }

  throw new Error("NEXTAUTH_SECRET is not configured. Add it to .env.local.");
}

function buildProviders(): Provider[] {
  const providers: Provider[] = [];

  // Registering Google without credentials renders a button that can only fail
  // with OAuthSignin, so it is omitted entirely until configured.
  if (isGoogleConfigured(process.env)) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  providers.push(
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        await connectDB();
        const user = await User.findOne({ email: parsed.data.email }).select("+passwordHash");
        const passwordMatches = await bcrypt.compare(
          parsed.data.password,
          user?.passwordHash || DUMMY_HASH
        );

        const outcome = evaluateCredentialLogin(user, passwordMatches);
        if (outcome === "EMAIL_NOT_VERIFIED") throw new Error("EMAIL_NOT_VERIFIED");
        if (outcome !== "OK" || !user) return null;

        user.lastLoginAt = new Date();
        user.providers ||= [];
        if (!user.providers.includes("credentials")) user.providers.push("credentials");
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    })
  );

  return providers;
}

export const authOptions: NextAuthOptions = {
  secret: resolveSecret(),
  session: {
    strategy: "jwt",
    maxAge: sessionMaxAge,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: sessionMaxAge,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: buildProviders(),
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.trim().toLowerCase();
      const googleProfile = profile as { email_verified?: boolean; picture?: string } | undefined;
      if (!email || googleProfile?.email_verified === false) return false;

      await connectDB();
      let dbUser = await User.findOne({ email });
      const isNewCustomer = !dbUser;

      if (dbUser) {
        dbUser.name = user.name?.trim() || dbUser.name;
        dbUser.avatar = googleProfile?.picture || user.image || dbUser.avatar;
        dbUser.isVerified = true;
        dbUser.lastLoginAt = new Date();
        dbUser.providers ||= [];
        if (!dbUser.providers.includes("google")) dbUser.providers.push("google");
        await dbUser.save();
      } else {
        try {
          dbUser = await User.create({
            name: user.name?.trim() || email.split("@")[0],
            email,
            avatar: googleProfile?.picture || user.image,
            providers: ["google"],
            role: "customer",
            isVerified: true,
            lastLoginAt: new Date(),
          });
        } catch (error) {
          if ((error as { code?: number }).code !== 11000) throw error;
          dbUser = await User.findOne({ email });
          if (!dbUser) throw error;
        }
      }

      user.id = dbUser._id.toString();
      user.role = dbUser.role;
      user.sessionVersion = dbUser.sessionVersion;
      user.image = dbUser.avatar;

      if (isNewCustomer) {
        notifyLater("google-registered", sendCustomerRegisteredEmail(dbUser.email, dbUser.name));
        notifyLater("google-verified", sendEmailVerifiedEmail(dbUser.email, dbUser.name));
        notifyLater("admin-new-customer", sendAdminNewCustomerEmail({ email: dbUser.email, name: dbUser.name }));
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.invalid = false;
        token.lastChecked = Math.floor(Date.now() / 1000);
        return token;
      }

      const now = Math.floor(Date.now() / 1000);
      const shouldRefresh =
        trigger === "update" ||
        !token.lastChecked ||
        now - Number(token.lastChecked) >= profileRefreshSeconds;

      if (!shouldRefresh) return token;

      const userId = token.userId || token.sub;
      if (!userId) {
        token.invalid = true;
        return token;
      }

      await connectDB();
      const dbUser = await User.findById(userId).select("name email role avatar sessionVersion");
      if (!dbUser || dbUser.sessionVersion !== token.sessionVersion) {
        token.invalid = true;
        return token;
      }

      token.invalid = false;
      token.userId = dbUser._id.toString();
      token.name = dbUser.name;
      token.email = dbUser.email;
      token.picture = dbUser.avatar;
      token.role = dbUser.role;
      token.lastChecked = now;
      return token;
    },
    async session({ session, token }) {
      if (token.invalid || !token.role || !session.user) {
        session.user = undefined;
        return session;
      }

      session.user.id = String(token.userId);
      session.user.role = token.role;
      session.user.image = token.picture;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
