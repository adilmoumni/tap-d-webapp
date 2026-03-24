import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ------------------------------------------------------------------
   Proxy — normalize legacy /@slug URLs to /slug.
------------------------------------------------------------------ */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /@username → /username
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2);
    if (!username) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = `/${username}`;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|d/).*)"],
};
