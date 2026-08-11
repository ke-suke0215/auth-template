import { Hono } from "hono";

import { createAuth, type Env } from "../src/auth/create-auth";

const unauthorized = { error: "Unauthorized" } as const;

export const api = new Hono<{ Bindings: Env }>()
  // Better Auth owns its own body and request handling. Do not add a Hono body
  // parser before this route.
  .all("/api/auth/*", (context) => createAuth(context.env).handler(context.req.raw))
  .get("/api/me", async (context) => {
    const session = await createAuth(context.env).api.getSession({
      headers: context.req.raw.headers,
    });

    if (!session) {
      return context.json(unauthorized, 401);
    }

    return context.json({
      id: session.user.id,
      email: session.user.email,
    });
  })
  .all("/api/*", (context) => context.json({ error: "Not Found" }, 404));

export function createApp() {
  return api;
}

export type ApiApp = typeof api;
