import type { Env } from "../src/auth/create-auth";

declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {
    TEST_MIGRATIONS: Array<{
      name: string;
      queries: string[];
    }>;
  }
}
