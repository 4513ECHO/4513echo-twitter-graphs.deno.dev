import { css } from "hono/css";
import { createRoute } from "honox/factory";
import Chart from "../islands/chart.tsx";

const wrapperClass = css`
  position: relative;
  overflow-x: scroll;
`;
const containerClass = css`
  height: 100vh;
`;
const canvasClass = css`
  position: absolute;
  left: 0;
  top: 0;
`;

const ChartColors = {
  Green: "rgb(75, 192, 192)",
  Blue: "rgb(54, 162, 235)",
};

type TweetCount = [string, [number, number]];

export default createRoute(
  async (c, next) => {
    const isProd = Deno.env.has("DENO_DEPLOYMENT_ID");
    if (!isProd) {
      Deno.env.set(
        "DENO_KV_ACCESS_TOKEN",
        import.meta.env.DENO_KV_ACCESS_TOKEN,
      );
    }
    c.set("kv", await Deno.openKv(isProd ? undefined : import.meta.env.KV_URL));
    await next();
  },
  async (c) => {
    const kv = c.get("kv");
    const data = await Array.fromAsync(kv.list({ prefix: ["tweet_count"] }))
      .then((data) =>
        data.map(({ key, value }) => [key[1], value] as TweetCount)
      );

    return c.render(
      <div class={wrapperClass}>
        <div class={containerClass}>
          <Chart
            canvas={{
              class: canvasClass,
              height: 700,
              width: data.length * 4,
            }}
            type="bar"
            options={{
              plugins: { tooltip: { mode: "index" } },
              responsive: false,
              scales: {
                y: { beginAtZero: true, stacked: true },
                x: {
                  grid: { offset: false },
                  stacked: true,
                  ticks: { align: "start" },
                  type: "time",
                  time: {
                    tooltipFormat: "yyyy-MM-dd",
                    unit: "month",
                    minUnit: "day",
                    displayFormats: { month: "yyyy/MM" },
                  },
                },
              },
            }}
            data={{
              labels: data.map(([date]) => date),
              datasets: [
                {
                  label: "Normal Tweets",
                  data: data.map(([, count]) => count[0]),
                  backgroundColor: ChartColors.Blue,
                },
                {
                  label: "Retweets",
                  data: data.map(([, count]) => count[1]),
                  backgroundColor: ChartColors.Green,
                },
              ],
            }}
          />
        </div>
      </div>,
      { title: "4513echo-twitter-graphs.deno.dev" },
    );
  },
);
