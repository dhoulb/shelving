import { Hydrations } from "../util/index.js";
import { AddEntriesTransform } from "./AddEntriesTransform.js";
import { AddItemsTransform } from "./AddItemsTransform.js";
import { IncrementTransform } from "./IncrementTransform.js";
import { DataTransform } from "./DataTransform.js";
import { RemoveEntriesTransform } from "./RemoveEntriesTransform.js";
import { RemoveItemsTransform } from "./RemoveItemsTransform.js";

/** Set of hydrations for all transform classes. */
export const TRANSFORM_HYDRATIONS = {
	increment: IncrementTransform,
	addItems: AddItemsTransform,
	removeItems: RemoveItemsTransform,
	addEntries: AddEntriesTransform,
	removeEntries: RemoveEntriesTransform,
	transforms: DataTransform,
};
TRANSFORM_HYDRATIONS as Hydrations;
