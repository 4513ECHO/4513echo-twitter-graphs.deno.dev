import { Suspense } from "react";
import { createRoute } from "honox/factory";
import Chart from "../islands/chart.tsx";
import {
  OriginContext,
  prefetch,
  PrefetchContext,
} from "../islands/prefetch.ts";

const cache = await caches.open("prefetch-cache");

export default createRoute((c) => {
  const origin = new URL(c.req.url).origin;
  console.log("origin", origin);
  return c.render(
    <div style={{ position: "relative", overflowX: "scroll" }}>
      <OriginContext value={origin}>
        <Suspense fallback={<div>Loading...</div>}>
          <div style={{ height: "100vh" }}>
            <Chart />
          </div>
        </Suspense>
      </OriginContext>
    </div>,
    { title: "tweet-graph.4513echo.dev" },
  );
});
