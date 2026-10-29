// Group every subscription by category for the feeds overview; `query`
// matches title, feed URL or site URL. Categories and feeds sort by title.
export function groupFeedsForOverview(feeds, categories, query = "") {
  const needle = query.trim().toLowerCase();
  const matches = (feed) =>
    !needle ||
    [feed.title, feed.url, feed.site_url].some((value) =>
      (value || "").toLowerCase().includes(needle),
    );
  const byCategory = new Map();
  for (const feed of feeds) {
    if (!matches(feed)) continue;
    const key = feed.categoryId ?? "uncategorized";
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key).push(feed);
  }
  const compare = (a, b) =>
    (a.title || "").localeCompare(b.title || "", undefined, {
      sensitivity: "base",
    });
  return [...byCategory.entries()]
    .map(([id, list]) => ({
      id,
      title: categories.find((c) => c.id === id)?.title || "",
      feeds: list.sort(compare),
    }))
    .sort(compare);
}
