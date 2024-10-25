import {
  Chart,
  type ChartConfiguration,
  type ChartType,
  type DefaultDataPoint,
} from "chart.js/auto";
import { type JSX, useEffect, useRef } from "hono/jsx";

function useChart<
  Type extends ChartType,
  Data = DefaultDataPoint<Type>,
  Label = unknown,
>(options: ChartConfiguration<Type, Data, Label>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<Type, Data, Label> | null>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      throw new Error("canvas is null");
    }
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(
      canvasRef.current,
      options,
    );

    return () => {
      chartRef.current?.destroy();
    };
  }, [canvasRef, options]);

  return { canvasRef, chartRef };
}

export default function ChartComponent<Type extends ChartType>(
  props: ChartConfiguration<Type> & {
    canvas?: JSX.IntrinsicElements["canvas"];
  },
) {
  const { canvasRef, chartRef } = useChart<Type>(props);

  useEffect(() => {
    chartRef.current?.render();
  }, []);

  return <canvas ref={canvasRef} {...props.canvas} />;
}
