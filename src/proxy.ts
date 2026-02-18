import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isDashboard = path.startsWith("/dashboard");
  const isLogin = path === "/login";

  const sessionToken =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  /*
   * Onboarding Check:
   * If accessing /onboarding and cookie says completed -> redirect to dashboard
   * Note: We do NOT strictly block /dashboard here based on cookie absence
   * to support backward compatibility (old users might not have cookie yet).
   * The DashboardLayout handles the strict DB check for /dashboard access.
   */
  const onboardingCompleted =
    request.cookies.get("onboarding-completed")?.value === "true";

  if (path === "/onboarding" && onboardingCompleted) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect dashboard routes
  if (isDashboard && !sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (isLogin && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/api/auth/:path*", "/onboarding"],
};
