// Settings stored by upstream Nextflux (or an older fork build) predate these
// defaults; apply them once instead of leaving the upstream value in place.
export const forkDefaultOverrides = {
  1: { listLayout: "feedly", markAsReadOnScroll: true, hideEmptyFeeds: true },
  // Open on Unread like Feedly, unless a start page was already chosen.
  2: (stored) => (stored.startPage ? {} : { startPage: "unread" }),
  // Order by arrival like Feedly's "Latest" (Settings → General → Sort field).
  3: { sortField: "created_at" },
};

export function applyForkDefaults(stored, defaults) {
  const version = Number(stored.forkDefaults) || 0;
  const next = { ...stored };
  for (const [level, overrides] of Object.entries(forkDefaultOverrides)) {
    if (Number(level) > version)
      Object.assign(
        next,
        typeof overrides === "function" ? overrides(next) : overrides,
      );
  }
  next.forkDefaults = defaults.forkDefaults;
  return next;
}
