import { createApp } from "./app";

const app = createApp();

export default {
  fetch(request, env, executionContext) {
    return app.fetch(request, env, executionContext);
  },
} satisfies ExportedHandler<import("../src/auth/create-auth").Env>;
