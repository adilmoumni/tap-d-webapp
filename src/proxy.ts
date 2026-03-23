import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ------------------------------------------------------------------
   Proxy — rewrites /@username URLs to /u/[username] internally.
   This avoids issues with Next.js treating @ as a parallel route prefix.
------------------------------------------------------------------ */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite /@username → /bio/username (internal route)
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2); // remove /@
    const url = request.nextUrl.clone();
    url.pathname = `/u/${username}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|d/).*)"],
};
