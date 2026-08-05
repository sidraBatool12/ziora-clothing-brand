import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const authProxy = withAuth(
  function onRequest(request) {
    const role = request.nextauth.token?.role;
    const pathname = request.nextUrl.pathname;

    if (pathname === "/admin/login") {
      return role === "admin"
        ? NextResponse.redirect(new URL("/admin", request.url))
        : NextResponse.next();
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return role
        ? NextResponse.redirect(new URL("/dashboard", request.url))
        : NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (pathname.startsWith("/dashboard") && role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || process.env.JWT_SECRET,
    callbacks: {
      authorized: ({ token, req }) =>
        req.nextUrl.pathname.startsWith("/admin") || Boolean(token && !token.invalid),
    },
    pages: {
      signIn: "/login",
    },
  }
);

export function proxy(...args: Parameters<typeof authProxy>) {
  return authProxy(...args);
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
