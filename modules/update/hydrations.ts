import { Hydrations } from "../util/index.js";
import { ItemsUpdate } from "./ItemsUpdate.js";
import { EntriesUpdate } from "./EntriesUpdate.js";
import { Increment } from "./Increment.js";
import { DataUpdate } from "./DataUpdate.js";

/** Set of hydrations for all transform classes. */
export const TRANSFORM_HYDRATIONS = {
	Increment,
	ItemsUpdate,
	EntriesUpdate,
	DataUpdate,
};
TRANSFORM_HYDRATIONS as Hydrations;
