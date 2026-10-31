import test from "node:test";
import assert from "node:assert/strict";
import { mergeKeepingReadRows } from "../../src/domain/articles/mergeReadRows.js";
import { matchesListFilter } from "../../src/domain/articles/listFilter.js";

const row = (id, status = "unread") => ({ id, status });
const lookup = (rows) => new Map(rows.map((r) => [r.id, r]));
const unreadList = (article) => matchesListFilter(article, "unread");

test("rows that became read stay in place while new rows are inserted", () => {
  const previous = [row(3), row(2), row(1)];
  const fresh = [row(4), row(1)];
  const merged = mergeKeepingReadRows(
    previous,
    fresh,
    lookup([row(4), row(3, "read"), row(2, "read"), row(1)]),
    unreadList,
  );
  assert.deepEqual(
    merged.map(({ id, status }) => [id, status]),
    [
      [3, "read"],
      [2, "read"],
      [4, "unread"],
      [1, "unread"],
    ],
  );
});

test("rows deleted from the database are dropped and the tail is appended", () => {
  const merged = mergeKeepingReadRows(
    [row(2), row(1)],
    [row(1), row(0)],
    lookup([row(1), row(0)]),
    unreadList,
  );
  assert.deepEqual(
    merged.map(({ id }) => id),
    [1, 0],
  );
});

test("unread rows pushed off the page by newer rows are not kept on top", () => {
  // First sync wrote an old feed first; the next page is all newer rows.
  const previous = [row(3), row(2), row(1)];
  const fresh = [row(9), row(8), row(7)];
  const merged = mergeKeepingReadRows(
    previous,
    fresh,
    lookup([row(3), row(2), row(1), row(9), row(8), row(7)]),
    unreadList,
  );
  assert.deepEqual(
    merged.map(({ id }) => id),
    [9, 8, 7],
  );
});

test("under the All filter nothing off the page is retained", () => {
  const merged = mergeKeepingReadRows(
    [row(2, "read"), row(1)],
    [row(5), row(4)],
    lookup([row(2, "read"), row(1), row(5), row(4)]),
    (article) => matchesListFilter(article, "all"),
  );
  assert.deepEqual(
    merged.map(({ id }) => id),
    [5, 4],
  );
});

test("matchesListFilter", () => {
  assert.equal(matchesListFilter(row(1), "unread"), true);
  assert.equal(matchesListFilter(row(1, "read"), "unread"), false);
  assert.equal(matchesListFilter(row(1, "removed"), "all"), false);
  assert.equal(matchesListFilter({ id: 1, starred: 1 }, "starred"), true);
  assert.equal(matchesListFilter({ id: 1, starred: 0 }, "starred"), false);
});
