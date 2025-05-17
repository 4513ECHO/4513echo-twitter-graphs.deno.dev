import { createRoute } from "honox/factory";
import { streamSSE } from "hono/streaming";

export default createRoute((c) => {
  const kv = c.get("kv");
  return streamSSE(c, async (stream) => {
    for await (
      const { key, value } of kv.list<[number, number]>({
        prefix: ["tweet_count"],
      })
    ) {
      await stream.writeSSE({
        event: "message",
        data: JSON.stringify([key[1], value]),
      });
    }
    await stream.writeSSE({ event: "close", data: "" });
  });
});
