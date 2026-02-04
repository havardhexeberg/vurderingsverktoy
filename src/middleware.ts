import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Redirect to dashboard if already logged in and trying to access login
    if (path === "/login" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Check role-based access
    if (path.startsWith("/foresatt") && token?.role !== "PARENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Allow public paths
        if (path === "/login" || path === "/" || path.startsWith("/api/auth")) {
          return true
        }

        // Require authentication for other paths
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
