import type { Hydrations } from "../util/hydrate.js";
import { ArrayUpdate } from "./ArrayUpdate.js";
import { DataUpdate } from "./DataUpdate.js";
import { Delete } from "./Delete.js";
import { DictionaryUpdate } from "./DictionaryUpdate.js";
import { Increment } from "./Increment.js";

/** Set of hydrations for all update classes. */
export const UPDATE_HYDRATIONS: Hydrations = {
	Increment,
	Delete,
	ArrayUpdate,
	DictionaryUpdate,
	DataUpdate,
};
