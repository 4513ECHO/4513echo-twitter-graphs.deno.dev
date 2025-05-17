import { createContext } from "react";

type PrefetchData = {
  begin: string;
  latest: string;
  total: number;
};

export async function prefetch(
  origin: string,
  cache?: Cache,
): Promise<PrefetchData> {
  const url = new URL("/api/prefetch", origin);
  const cached = await cache?.match(url);
  if (cached) {
    return cached.json();
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to prefetch: ${response.status}`);
  }
  await cache?.put(url, response.clone());
  return response.json();
}

export const PrefetchContext = createContext<Promise<PrefetchData>>(
  new Promise(() => {}),
);

export const OriginContext = createContext("initial");
