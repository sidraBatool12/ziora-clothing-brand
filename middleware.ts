import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hasToken = request.cookies.has("ziora_token");
  if (!hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
