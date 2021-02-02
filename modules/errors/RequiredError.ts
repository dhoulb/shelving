/** Thrown if a value is required but wasn't provided. */
export class RequiredError extends Error {
	constructor(message = "Value required") {
		super(message);
	}
}
RequiredError.prototype.name = "RequiredError";
