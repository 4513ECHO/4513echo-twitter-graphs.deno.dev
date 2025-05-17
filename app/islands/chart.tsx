import { use, useRef } from "react";
import { BarElement, Chart, LinearScale, TimeScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { OriginContext, prefetch, PrefetchContext } from "./prefetch.ts";
import { useChartUpdate } from "./eventsource.tsx";

const ChartColors = {
  Green: "rgb(75, 192, 192)",
  Blue: "rgb(54, 162, 235)",
};

export default function ChartComponent() {
  Chart.register(BarElement, LinearScale, TimeScale, Tooltip);
  const chartRef = useRef<Chart<"bar">>(null);
  // const prefetchPromise = use(PrefetchContext);
  // const { begin, latest, total } = use(prefetchPromise);
  const origin = use(OriginContext);
  console.log("origin", origin);
  const { begin, latest, total } = use(prefetch(origin));
  // const { begin, latest, total } = use(PrefetchContext);

  useChartUpdate(chartRef);

  return (
    <Bar
      ref={chartRef}
      style={{ position: "absolute", left: 0, top: 0 }}
      height={700}
      width={total * 4}
      options={{
        plugins: { tooltip: { mode: "index" } },
        animation: false,
        responsive: false,
        maintainAspectRatio: false,
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
            min: new Date(begin).valueOf(),
            max: new Date(latest).valueOf(),
          },
        },
      }}
      data={{
        labels: [],
        datasets: [
          {
            label: "Normal Tweets",
            data: [],
            backgroundColor: ChartColors.Blue,
          },
          {
            label: "Retweets",
            data: [],
            backgroundColor: ChartColors.Green,
          },
        ],
      }}
    />
  );
}
