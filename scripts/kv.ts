import { datetime } from "https://deno.land/x/ptera@v1.0.2/mod.ts";
import TWEET_DATES from "@/tweet_dates.json" with { type: "json" };

const kv = await Deno.openKv(Deno.env.get("KV_URL"));

const items = Object.entries(Object.groupBy(
  TWEET_DATES.map(({ date, isRT }) => (
    { date: datetime(new Date(date), { timezone: "Asia/Tokyo" }), isRT }
  )),
  ({ date }) => date.toISODate(),
)) // [date, [normal, rt]]
  .sort(([a], [b]) => a.localeCompare(b))
  .map<[string, [number, number]]>(([date, dates]) => [
    date,
    dates.reduce<[number, number]>(
      (acc, { isRT }) => [acc[0] + (isRT ? 0 : 1), acc[1] + (isRT ? 1 : 0)],
      [0, 0],
    ),
  ]);

function fillDates(items: [string, [number, number]][]): void {
  const since = datetime(items[0][0]);
  const until = datetime(items.at(-1)![0]);
  const dateMap = Object.fromEntries(items);
  let now = since;
  while (now.isBefore(until)) {
    if (!dateMap[now.toISODate()]) {
      items.push([now.toISODate(), [0, 0]]);
    }
    now = now.add({ day: 1 });
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
