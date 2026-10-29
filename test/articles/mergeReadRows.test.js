import test from "node:test";
import assert from "node:assert/strict";
import { mergeKeepingReadRows } from "../../src/domain/articles/mergeReadRows.js";

const row = (id, status = "unread") => ({ id, status });
const lookup = (rows) => new Map(rows.map((r) => [r.id, r]));

test("rows that became read stay in place while new rows are inserted", () => {
  const previous = [row(3), row(2), row(1)];
  const fresh = [row(4), row(1)];
  const merged = mergeKeepingReadRows(
    previous,
    fresh,
    lookup([row(4), row(3, "read"), row(2, "read"), row(1)]),
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
  );
  assert.deepEqual(
    merged.map(({ id }) => id),
    [1, 0],
  );
});
