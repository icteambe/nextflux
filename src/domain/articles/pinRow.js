// Scroll `viewport` so `row` sits at its top, correcting for a short while:
// right after the previous article collapses and the new one expands, the
// virtual list's size cache is stale and a single scrollToIndex lands wrong.
// Any user input (wheel, touch, key, mouse) ends the correction at once so the
// reader never fights it. Returns a cancel function; `onDone` runs when the
// row is stable, the time budget is spent, or the user took over.
const USER_INPUT = ["wheel", "touchstart", "keydown", "mousedown"];

export function pinRowToTop(
  viewport,
  findRow,
  {
    duration = 1000,
    onDone,
    now = () => performance.now(),
    listen = true,
  } = {},
) {
  let finished = false;
  let stable = 0;
  const started = now();
  const finish = () => {
    if (finished) return;
    finished = true;
    if (listen)
      USER_INPUT.forEach((type) =>
        window.removeEventListener(type, finish, true),
      );
    onDone?.();
  };
  if (listen)
    USER_INPUT.forEach((type) =>
      window.addEventListener(type, finish, { capture: true, passive: true }),
    );
  const step = () => {
    if (finished) return;
    const row = findRow();
    if (row) {
      const delta =
        row.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
      if (Math.abs(delta) > 1) {
        viewport.scrollTop += delta;
        stable = 0;
      } else {
        stable += 1;
      }
    }
    if (now() - started < duration && stable < 4) {
      requestAnimationFrame(step);
    } else {
      finish();
    }
  };
  requestAnimationFrame(step);
  return finish;
}

// Where the space bar should take the reader: the next article once the end
// of the open one is on screen, otherwise one page down.
export function spaceAction(viewport, openRow) {
  if (openRow) {
    const bottom =
      openRow.getBoundingClientRect().bottom -
      viewport.getBoundingClientRect().top;
    if (bottom <= viewport.clientHeight + 2) return "next";
  }
  return "page";
}
