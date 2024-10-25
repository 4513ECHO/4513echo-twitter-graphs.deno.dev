import { isBefore } from "@fabon/vremel";
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
  .map<[string, [number, number]]>(([date, dates]) => [
    date,
    dates?.reduce<[number, number]>(
      (acc, { isRT }) => (acc[isRT ? 1 : 0]++, acc),
      [0, 0],
    ) ?? [0, 0],
  ]);

function fillDates(items: [string, [number, number]][]): void {
  const since = Temporal.PlainDate.from(items[0]![0]);
  const until = Temporal.PlainDate.from(items.at(-1)![0]);
  const dateMap = Object.fromEntries(items);
  let now = since;
  while (isBefore(now, until)) {
    if (!dateMap[now.toString()]) {
      items.push([now.toString(), [0, 0]]);
    }
    now = now.add({ days: 1 });
  }
  items.sort(([a], [b]) => a.localeCompare(b));
}
fillDates(items);

switch (Deno.args[0]) {
  case "set": {
    let [atomic, count] = [kv.atomic(), 0];
    const promises: Promise<Deno.KvCommitResult | Deno.KvCommitError>[] = [];
    for (const [date, counts] of items) {
      atomic.set(["tweet_count", date], counts);
      if (count >= 100) {
        promises.push(atomic.commit());
        [atomic, count] = [kv.atomic(), 0];
      }
      count++;
    }
    promises.push(atomic.commit());
    console.log(await Promise.all(promises));
    break;
  }
  case "get": {
    for await (const item of kv.list({ prefix: ["tweet_count"] })) {
      console.log([item.key[1], item.value]);
    }
    break;
  }
  case "show": {
    for (const item of items) {
      console.log(item);
    }
    break;
  }
}
