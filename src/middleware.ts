import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  console.log("🚀 Middleware executed for:", req.nextUrl.pathname);
  console.log("🌐 Host:", req.headers.get("host"));
  console.log("🍪 All Cookies:", req.cookies.getAll());

  const token = req.cookies.get("token")?.value;

  if (!token) {
    console.log("No token, redirecting to login...");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if(req.nextUrl.pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/"], // Ensure this matches the route correctly
};
