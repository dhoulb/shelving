/** RequiredError is thrown if a value was required but didn't exist. */
export class RequiredError extends Error {
	constructor(message = "Value is required") {
		super(message);
	}
}
RequiredError.prototype.name = "RequiredError";
