import { Hydrations } from "../util/index.js";
import { ArrayUpdate } from "./ArrayUpdate.js";
import { ObjectUpdate } from "./ObjectUpdate.js";
import { Increment } from "./Increment.js";
import { DataUpdate } from "./DataUpdate.js";

/** Set of hydrations for all transform classes. */
export const TRANSFORM_HYDRATIONS = {
	Increment,
	ArrayUpdate,
	ObjectUpdate,
	DataUpdate,
};
TRANSFORM_HYDRATIONS as Hydrations;
