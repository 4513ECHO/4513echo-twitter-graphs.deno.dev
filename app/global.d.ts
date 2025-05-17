import "hono";
import "@hono/react-renderer";

declare module "hono" {
  // @ts-expect-error: Suppress "duplicate identifier" error
  interface Env {
    Variables: { kv: Deno.Kv };
    Bindings: Record<PropertyKey, never>;
  }
}

declare module "@hono/react-renderer" {
  interface Props {
    title?: string;
  }
}
