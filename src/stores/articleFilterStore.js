import { atom } from "nanostores";
import { settingsState } from "./settingsStore.js";
import { getStartFilter } from "../domain/preferences/startPage.js";

// Apply the default once per page load, then preserve the user's selection across routes.
export const filter = atom(getStartFilter(settingsState.get()));
