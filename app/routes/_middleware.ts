import { createRoute } from "honox/factory";
import { createMiddleware } from "hono/factory";

const kvMiddleware = createMiddleware(async (c, next) => {
  if (Deno.env.has("DENO_DEPLOYMENT_ID")) {
    c.set("kv", await Deno.openKv());
  } else {
    Deno.env.set(
      "DENO_KV_ACCESS_TOKEN",
      import.meta.env.DENO_KV_ACCESS_TOKEN,
    );
    c.set("kv", await Deno.openKv(import.meta.env.KV_URL));
  }
  await next();
});

export default createRoute(kvMiddleware);
