import test from "node:test";
import assert from "node:assert/strict";
import { applyForkDefaults } from "../../src/domain/preferences/forkDefaults.js";
import { settingsDefaults } from "../../src/domain/preferences/settingsDefaults.js";

test("settings saved by upstream get the fork defaults once", () => {
  const upstream = { markAsReadOnScroll: false, fontSize: 18 };
  const migrated = applyForkDefaults(upstream, settingsDefaults);
  assert.equal(migrated.markAsReadOnScroll, true);
  assert.equal(migrated.listLayout, "feedly");
  assert.equal(migrated.fontSize, 18);
  assert.equal(migrated.forkDefaults, settingsDefaults.forkDefaults);
});

test("a user's later choice is kept", () => {
  const stored = { forkDefaults: 1, markAsReadOnScroll: false };
  assert.equal(
    applyForkDefaults(stored, settingsDefaults).markAsReadOnScroll,
    false,
  );
});
