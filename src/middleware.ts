import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/admin/login";
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute && !isLoginPage && !isLoggedIn) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && isLoggedIn) {
    const adminUrl = new URL("/admin", req.nextUrl.origin);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
