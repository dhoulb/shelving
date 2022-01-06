import type { Hydrations } from "../util/index.js";
import { AddOperation } from "./AddOperation.js";
import { DeleteOperation } from "./DeleteOperation.js";
import { SetOperation } from "./SetOperation.js";
import { UpdateOperation } from "./UpdateOperation.js";
import { WriteOperations } from "./WriteOperation.js";

/** Set of hydrations for all change classes. */
export const OPERATION_HYDRATIONS = {
	WriteOperations,
	AddOperation,
	SetOperation,
	UpdateOperation,
	DeleteOperation,
};
OPERATION_HYDRATIONS as Hydrations;
