import { cookies } from "next/headers";
import { createLocalbase } from "@lb/js";

// Server-side localbase client for use in Server Components, Server Actions,
// and Route Handlers. Reads lb_at from the cookie jar and attaches it as the
// Bearer token for all outbound API calls.
export async function createClient() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("lb_at")?.value;

  const lb = createLocalbase({
    url: process.env.LOCALBASE_URL ??
         process.env.NEXT_PUBLIC_LOCALBASE_URL ??
         "http://localhost:7700",
  });

  if (accessToken) lb.auth.setToken(accessToken);
  return lb;
}
