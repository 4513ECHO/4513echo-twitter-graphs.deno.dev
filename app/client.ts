import { createClient } from "honox/client";

createClient({
  hydrate: async (elem, root) => {
    const { hydrateRoot } = await import("react-dom/client");
    hydrateRoot(root, elem);
  },
  createElement: async (type, props) => {
    const { createElement } = await import("react");
    // deno-lint-ignore no-explicit-any
    return createElement(type, props) as any;
  },
});
