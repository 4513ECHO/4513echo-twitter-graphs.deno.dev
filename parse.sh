#!/bin/sh
set -eux
export TZ=UTC ARCHIVE_PATH="$1"
gsed '1c [' < "$ARCHIVE_PATH"/data/tweets.js \
  | jq -c 'map({ date: .tweet.created_at | strptime("%a %b %d %T %z %Y") | todate, isRT: .tweet.full_text | startswith("RT @") })' \
  > ./tweet_dates.json
