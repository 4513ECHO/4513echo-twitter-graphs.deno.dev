import { type RefObject, useEffect, useRef } from "react";
import { useEffectEvent } from "use-effect-event";
import type { Chart } from "chart.js";

type TweetCount = [string, [number, number]];

export function useChartUpdate(chartRef: RefObject<Chart<"bar"> | null>) {
  const eventSourceRef = useRef<EventSource>(null);

  const onMessage = useEffectEvent((event: MessageEvent) => {
    const data = JSON.parse(event.data) as TweetCount;
    const chart = chartRef.current;
    if (!chart?.data.labels) return;
    chart.data.labels.push(data[0]);
    chart.data.datasets[0]?.data.push(data[1][0]);
    chart.data.datasets[1]?.data.push(data[1][1]);
    if (chart.data.labels.length % 20 === 0) {
      chart.update();
    }
  });

  const onClose = useEffectEvent(() => {
    chartRef.current?.update();
    eventSourceRef.current?.close();
  });

  useEffect(() => {
    const eventSource = new EventSource("/api/stream");
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("message", onMessage);
    eventSource.addEventListener("close", onClose);

    return () => {
      eventSource.removeEventListener("message", onMessage);
      eventSource.removeEventListener("close", onClose);
      eventSource.close();
    };
  }, []);
}
