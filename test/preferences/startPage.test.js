import test from "node:test";
import assert from "node:assert/strict";
import {
  getStartFilter,
  getStartPath,
} from "../../src/domain/preferences/startPage.js";

test("start page picks the initial filter and honours the legacy switch", () => {
  assert.equal(getStartFilter({ startPage: "unread" }), "unread");
  assert.equal(getStartFilter({ startPage: "starred" }), "starred");
  assert.equal(getStartFilter({ startPage: "all" }), "all");
  assert.equal(
    getStartFilter({ startPage: "firstCategory", showUnreadByDefault: true }),
    "unread",
  );
  assert.equal(getStartFilter({}), "all");
});

test("only the first-category start page redirects, and only once there is one", () => {
  assert.equal(getStartPath({ startPage: "firstCategory" }, []), null);
  assert.equal(getStartPath({ startPage: "all" }, [{ id: 3 }]), null);
  assert.equal(
    getStartPath({ startPage: "firstCategory" }, [{ id: 3 }, { id: 1 }]),
    "/category/3",
  );
});
