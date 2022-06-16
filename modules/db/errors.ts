import { RequiredError } from "../error/RequiredError.js";
import type { Reference } from "./Reference.js";

/** Thrown if a reference doesn't exist. */
export class ReferenceRequiredError extends RequiredError {
	readonly ref: Reference;
	constructor(ref: Reference) {
		super(`Reference ${ref} does not exist`);
		this.ref = ref;
	}
}
ReferenceRequiredError.prototype.name = "ReferenceRequiredError";
