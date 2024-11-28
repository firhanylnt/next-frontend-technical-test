import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/admin"];

export default async function middleware(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value || "";
    const { pathname } = req.nextUrl;

    if (protectedRoutes.some((path) => pathname.startsWith(path)) && !token) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    if(!token && pathname === '/'){
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware error:", err);
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/", "/login"],
};
