import { atom } from "nanostores";

// The row the keyboard acts on when no article is open: the last article that
// was opened or closed, so `o` reopens it after closing.
export const cursorArticleId = atom(null);
// Opened by Shift+A; the list renders the confirmation dialog.
export const markAllReadConfirmOpen = atom(false);
