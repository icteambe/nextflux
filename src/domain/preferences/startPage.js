// Feedly-style start page: which list the app opens on a fresh page load.
export function getStartFilter({ startPage, showUnreadByDefault } = {}) {
  if (startPage === "unread" || startPage === "starred") return startPage;
  if (startPage === "all") return "all";
  return showUnreadByDefault ? "unread" : "all";
}

export function getStartPath({ startPage } = {}, categories = []) {
  if (startPage !== "firstCategory" || !categories.length) return null;
  return `/category/${categories[0].id}`;
}
