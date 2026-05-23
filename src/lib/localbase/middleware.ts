import { NextResponse, type NextRequest } from "next/server";

const LB_URL =
  process.env.LOCALBASE_URL ??
  process.env.NEXT_PUBLIC_LOCALBASE_URL ??
  "http://localhost:7700";

// Decode the JWT payload without signature verification (for expiry checking only).
// Verification happens on the localbase server when the token is actually used.
function jwtPayload(token: string): { exp?: number } | null {
  try {
    const b64 = token.split(".")[1];
    if (!b64) return null;
    return JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function isExpired(token: string): boolean {
  const p = jwtPayload(token);
  if (!p?.exp) return true;
  // Refresh 30 s before actual expiry to avoid race conditions
  return Date.now() / 1000 >= p.exp - 30;
}

const COOKIE_OPTS_AT = {
  path: "/",
  maxAge: 15 * 60,
  sameSite: "lax" as const,
  httpOnly: false, // browser needs to read this for direct API calls
};

const COOKIE_OPTS_RT = {
  path: "/",
  maxAge: 30 * 24 * 3600,
  sameSite: "lax" as const,
  httpOnly: true,
};

export async function updateSession(request: NextRequest) {
  const at = request.cookies.get("lb_at")?.value;
  const rt = request.cookies.get("lb_rt")?.value;

  let accessToken: string | null | undefined = at;
  let freshAt: string | null = null;
  let freshRt: string | null = null;

  // Refresh if the access token is missing or about to expire
  if (!accessToken || isExpired(accessToken)) {
    if (rt) {
      try {
        const res = await fetch(`${LB_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: rt }),
        });
        const json = (await res.json()) as {
          data?: { access_token: string; refresh_token: string };
        };
        if (json.data?.access_token) {
          accessToken = json.data.access_token;
          freshAt = json.data.access_token;
          freshRt = json.data.refresh_token;
        } else {
          accessToken = null;
        }
      } catch {
        accessToken = null;
      }
    } else {
      accessToken = null;
    }
  }

  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith("/dashboard");
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (!accessToken && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (accessToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next({ request });

  // Write fresh tokens to both the response cookies and the forwarded request
  // headers so Server Components on this request see the new value immediately.
  if (freshAt && freshRt) {
    response.cookies.set("lb_at", freshAt, COOKIE_OPTS_AT);
    response.cookies.set("lb_rt", freshRt, COOKIE_OPTS_RT);
    request.cookies.set("lb_at", freshAt);
  }

  return response;
}
