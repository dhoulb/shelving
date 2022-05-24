import type { Feedback } from "../feedback/index.js";
import { ValidationError } from "../error/index.js";
import type { Resource } from "./Resource.js";

/** Thrown if an API `Resource` can't validate. */
export class ResourceValidationError<P, R> extends ValidationError {
	readonly resource: Resource<P, R>;
	constructor(resource: Resource<P, R>, feedback: Feedback) {
		super(`Invalid result for resource`, feedback);
		this.resource = resource;
	}
}
ResourceValidationError.prototype.name = "ResourceValidationError";
