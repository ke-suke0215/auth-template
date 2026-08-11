import { hc } from "hono/client";

import type { ApiApp } from "../../worker/app";

export const apiClient = hc<ApiApp>("/");
