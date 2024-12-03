import TWEET_DATES from "../tweet_dates.json" with { type: "json" };

const kv = await Deno.openKv(Deno.env.get("KV_URL"));

const items = Object.entries(Object.groupBy(
  TWEET_DATES.map(({ date, isRT }) => ({
    date: Temporal.Instant.from(date).toZonedDateTimeISO("Asia/Tokyo")
      .toPlainDate().toString(),
    isRT,
  })),
  ({ date }) => date,
)) // [date, [normal, rt]]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([date, dates]) => [date, dates?.map(({ isRT }) => isRT) ?? []] as const)
  .map<[string, [number, number]]>(([date, isRTs]) => [
    date,
    isRTs.reduce(
      (acc, isRT) => (acc[isRT ? 1 : 0]++, acc),
      [0, 0] as const,
    ),
  ]);

switch (Deno.args[0]) {
  case "set": {
    const result = await items
      .reduce(
        (atomic, [date, counts]) => atomic.set(["tweet_count", date], counts),
        kv.atomic(),
      )
      .commit();
    console.log(result);
    break;
  }
  case "get": {
    for await (const { key, value } of kv.list({ prefix: ["tweet_count"] })) {
      console.log([key[1], value]);
    }
    break;
  }
  case "clear": {
    const result =
      await (await Array.fromAsync(kv.list({ prefix: ["tweet_count"] })))
        .map(({ key }) => key)
        .reduce(
          (atomic, key) => atomic.delete(key),
          kv.atomic(),
        )
        .commit();
    console.log(result);
    break;
  }
  case "show": {
    for (const item of items) {
      console.log(item);
    }
    break;
  }
  default: {
    console.log("Usage: deno task kv [set|get|clear|show]");
    Deno.exit(1);
  }
}
