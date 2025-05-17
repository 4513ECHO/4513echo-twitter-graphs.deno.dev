import { createRoute } from "honox/factory";

export default createRoute(async (c) => {
  const kv = c.get("kv");
  const [
    { value: begin },
    { value: latest },
    { value: total },
  ] = await kv.getMany<[string, string, number]>([
    ["tweet_begin"],
    ["tweet_latest"],
    ["tweet_total"],
  ]);
  return c.json({ begin, latest, total });
});
