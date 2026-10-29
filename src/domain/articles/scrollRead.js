// Which rows were on screen before and have now scrolled above the viewport.
// Working from the previously visible ids (not list indexes) means rows that
// vanish from the list, or a programmatic jump, never mark unseen articles.
export function getScrolledPastIds(previousVisibleIds, articles, startIndex) {
  if (!previousVisibleIds.length || startIndex <= 0) return [];
  const above = new Set();
  for (let i = 0; i < startIndex && i < articles.length; i++) {
    above.add(articles[i].id);
  }
  return previousVisibleIds.filter((id) => above.has(id));
}

export function getVisibleIds(articles, { startIndex, endIndex }) {
  return articles.slice(startIndex, endIndex + 1).map(({ id }) => id);
}
