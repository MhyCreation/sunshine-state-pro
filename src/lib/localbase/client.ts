import { createLocalbase } from "@lb/js";

// Browser-side localbase client. Reads the access token from a cookie set by
// middleware or server actions so the browser can authenticate API calls.
export function createClient() {
  let token: string | null = null;

  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)lb_at=([^;]*)/);
    token = match ? decodeURIComponent(match[1]) : null;
  }

  const lb = createLocalbase({
    url: process.env.NEXT_PUBLIC_LOCALBASE_URL ?? "http://localhost:7700",
  });

  if (token) lb.auth.setToken(token);
  return lb;
}
