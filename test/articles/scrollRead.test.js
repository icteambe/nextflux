import test from "node:test";
import assert from "node:assert/strict";
import {
  getScrolledPastIds,
  getVisibleIds,
} from "../../src/domain/articles/scrollRead.js";

const list = (...ids) => ids.map((id) => ({ id }));

test("rows that were visible and are now above the range are returned", () => {
  const articles = list(1, 2, 3, 4, 5, 6);
  const prev = getVisibleIds(articles, { startIndex: 0, endIndex: 3 });
  assert.deepEqual(getScrolledPastIds(prev, articles, 2), [1, 2]);
});

test("rows never seen are not returned after a jump", () => {
  const articles = list(1, 2, 3, 4, 5, 6, 7, 8);
  const prev = getVisibleIds(articles, { startIndex: 0, endIndex: 1 });
  assert.deepEqual(getScrolledPastIds(prev, articles, 6), [1, 2]);
});

test("list shrinking does not mark the rows that moved up", () => {
  const prev = [1, 2, 3];
  const after = list(4, 5, 6, 7, 8);
  assert.deepEqual(getScrolledPastIds(prev, after, 2), []);
});

test("nothing is returned at the top or without history", () => {
  assert.deepEqual(getScrolledPastIds([1], list(1, 2), 0), []);
  assert.deepEqual(getScrolledPastIds([], list(1, 2), 1), []);
});
