// Does a cached article still belong to the list under this filter?
export function matchesListFilter(article, filter) {
  if (!article || article.status === "removed") return false;
  if (filter === "unread") return article.status === "unread";
  if (filter === "starred") return article.starred === 1;
  return true;
}
