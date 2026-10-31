import test from "node:test";
import assert from "node:assert/strict";
import { pinRowToTop, spaceAction } from "../../src/domain/articles/pinRow.js";

const box = (top, bottom = top + 32) => ({
  getBoundingClientRect: () => ({ top, bottom }),
});

// Drive requestAnimationFrame by hand; each frame advances a fake clock.
function fakeFrames(stepMs = 16) {
  const frames = [];
  let clock = 0;
  globalThis.requestAnimationFrame = (cb) => frames.push(cb);
  return {
    now: () => clock,
    run(max = 1000) {
      let ran = 0;
      while (frames.length && ran < max) {
        clock += stepMs;
        frames.shift()();
        ran += 1;
      }
      return ran;
    },
  };
}

test("pinRowToTop scrolls by the row offset until it is stable", () => {
  const clock = fakeFrames();
  let scrollTop = 100;
  let rowTop = 50; // row sits 40px below the viewport top (viewport top is 10)
  const viewport = {
    get scrollTop() {
      return scrollTop;
    },
    set scrollTop(value) {
      rowTop -= value - scrollTop;
      scrollTop = value;
    },
    getBoundingClientRect: () => ({ top: 10 }),
  };
  let done = false;
  pinRowToTop(viewport, () => box(rowTop), {
    now: clock.now,
    listen: false,
    onDone: () => (done = true),
  });
  clock.run();
  assert.equal(scrollTop, 140);
  assert.equal(rowTop, 10);
  assert.equal(done, true);
});

test("pinRowToTop gives up after its time budget when the row never settles", () => {
  const clock = fakeFrames(100);
  const viewport = {
    scrollTop: 0,
    getBoundingClientRect: () => ({ top: 0 }),
  };
  let done = false;
  pinRowToTop(viewport, () => box(500), {
    duration: 450,
    now: clock.now,
    listen: false,
    onDone: () => (done = true),
  });
  const ran = clock.run();
  assert.equal(ran, 5);
  assert.equal(done, true);
});

test("cancelling stops the correction", () => {
  const clock = fakeFrames();
  const viewport = { scrollTop: 0, getBoundingClientRect: () => ({ top: 0 }) };
  let done = 0;
  const cancel = pinRowToTop(viewport, () => box(500), {
    now: clock.now,
    listen: false,
    onDone: () => (done += 1),
  });
  cancel();
  clock.run();
  assert.equal(viewport.scrollTop, 0);
  assert.equal(done, 1);
});

test("space pages down until the end of the article shows, then moves on", () => {
  const viewport = {
    getBoundingClientRect: () => ({ top: 0 }),
    clientHeight: 700,
  };
  assert.equal(spaceAction(viewport, box(0, 2000)), "page");
  assert.equal(spaceAction(viewport, box(0, 650)), "next");
  assert.equal(spaceAction(viewport, null), "page");
});
