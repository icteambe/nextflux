// Merge a fresh page into the rows on screen without dropping rows that only
// left the query because they were read (Feedly keeps them until you leave the
// list). New rows are inserted where the query places them; rows gone from the
// database are dropped.
export function mergeKeepingReadRows(previous, fresh, lookup) {
  const freshIds = new Set(fresh.map(({ id }) => id));
  const merged = [];
  let next = 0;
  for (const row of previous) {
    if (freshIds.has(row.id)) {
      while (next < fresh.length) {
        const candidate = fresh[next++];
        merged.push(candidate);
        if (candidate.id === row.id) break;
      }
    } else if (lookup.has(row.id)) {
      merged.push(lookup.get(row.id));
    }
  }
  return merged.concat(fresh.slice(next));
}
