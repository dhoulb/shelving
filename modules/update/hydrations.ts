import { Hydrations } from "../util/hydrate.js";
import { Delete } from "./Delete.js";
import { Increment } from "./Increment.js";
import { ArrayUpdate } from "./ArrayUpdate.js";
import { ObjectUpdate } from "./ObjectUpdate.js";
import { DataUpdate } from "./DataUpdate.js";

/** Set of hydrations for all transform classes. */
export const TRANSFORM_HYDRATIONS: Hydrations = {
	Increment,
	Delete,
	ArrayUpdate,
	ObjectUpdate,
	DataUpdate,
};
