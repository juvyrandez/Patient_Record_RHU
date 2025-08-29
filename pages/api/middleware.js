import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { usertype } = decoded;

    // Protect dashboards by role
    if (req.nextUrl.pathname.startsWith("/admin_dashboard") && usertype !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (req.nextUrl.pathname.startsWith("/staff_dashboard") && usertype !== "staff") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (req.nextUrl.pathname.startsWith("/bhw_dashboard") && usertype !== "bhw") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (req.nextUrl.pathname.startsWith("/doctor_dashboard") && usertype !== "doctor") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Add user info to request headers for API routes
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', decoded.id);
    requestHeaders.set('x-user-type', decoded.usertype);
    requestHeaders.set('x-user-fullname', decoded.fullname);
    requestHeaders.set('x-user-username', decoded.username);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    console.error("Invalid token:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/admin_dashboard/:path*",
    "/staff_dashboard/:path*",
    "/bhw_dashboard/:path*",
    "/doctor_dashboard/:path*",
    "/api/profile/:path*",
  ],
};