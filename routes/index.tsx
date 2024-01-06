import type { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { ChartColors } from "$fresh_charts/utils.ts";
import Chart from "@/islands/chart.tsx";

type TweetCount = [string, [number, number]];
const kv = await Deno.openKv();

export const handler: Handlers<TweetCount[]> = {
  async GET(_req, ctx) {
    const data = (await Array.fromAsync(kv.list({ prefix: ["tweet_count"] })))
      .map(({ key, value }) => [key[1], value] as TweetCount);
    return ctx.render(data);
  },
};

export default function Home({ data }: PageProps<TweetCount[]>) {
  return (
    <>
      <Head>
        <title>4513echo-twitter-graphs.deno.dev</title>
      </Head>
      <Chart
        type="bar"
        options={{
          scales: {
            y: { beginAtZero: true, stacked: true },
            x: { stacked: true },
          },
          plugins: { tooltip: { mode: "index" } },
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
    </>
  );
}
