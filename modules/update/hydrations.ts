import { Hydrations } from "../util/hydrate.js";
import { Delete } from "./Delete.js";
import { Increment } from "./Increment.js";
import { ArrayUpdate } from "./ArrayUpdate.js";
import { DictionaryUpdate } from "./DictionaryUpdate.js";
import { DataUpdate } from "./DataUpdate.js";

/** Set of hydrations for all update classes. */
export const UPDATE_HYDRATIONS: Hydrations = {
	Increment,
	Delete,
	ArrayUpdate,
	DictionaryUpdate,
	DataUpdate,
};
