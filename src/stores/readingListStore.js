import { atom } from "nanostores";

// The row the keyboard acts on when no article is open: the last article that
// was opened or closed, so `o` reopens it after closing.
export const cursorArticleId = atom(null);
// Bumped by an explicit refresh so read rows kept on screen are dropped.
export const listEpoch = atom(0);
// Opened by Shift+A; the list renders the confirmation dialog.
export const markAllReadConfirmOpen = atom(false);
// Articles the reader marked unread on purpose: scrolling past them must not
// mark them read again (Feedly's "keep unread"). Reset when the list changes.
export const keptUnreadIds = atom(new Set());
