import test from "node:test";
import assert from "node:assert/strict";
import { groupFeedsForOverview } from "../../src/domain/feeds/feedsOverview.js";

const categories = [
  { id: 1, title: "Tech" },
  { id: 2, title: "All" },
];
const feeds = [
  {
    id: 10,
    title: "The Verge",
    url: "https://theverge.com/rss",
    categoryId: 1,
  },
  { id: 11, title: "Ars", url: "https://arstechnica.com/feed", categoryId: 1 },
  { id: 12, title: "Lobsters", url: "https://lobste.rs/rss", categoryId: 2 },
  {
    id: 13,
    title: "Orphan",
    url: "https://x.example/rss",
    categoryId: undefined,
  },
];

test("feeds are grouped by category, both sorted by title", () => {
  const groups = groupFeedsForOverview(feeds, categories);
  assert.deepEqual(
    groups.map((g) => [g.title, g.feeds.map((f) => f.title)]),
    [
      ["", ["Orphan"]],
      ["All", ["Lobsters"]],
      ["Tech", ["Ars", "The Verge"]],
    ],
  );
});

test("the query matches title or url and drops empty categories", () => {
  const groups = groupFeedsForOverview(feeds, categories, "lobste");
  assert.deepEqual(
    groups.map((g) => [g.title, g.feeds.map((f) => f.id)]),
    [["All", [12]]],
  );
  assert.equal(groups.length, 1);
  assert.equal(groupFeedsForOverview(feeds, categories, "zzz").length, 0);
});
