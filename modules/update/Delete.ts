import { Update } from "./Update.js";

/**
 * Delete update: an object that deletes a value.
 * - Hint: you can use negative numbers to decrement the number too!
 */
export class Delete extends Update<undefined> {
	transform(): undefined {
		return undefined;
	}
	override validate(): this {
		return this;
	}
}

/** Update that deletes any value. */
export const DELETE = new Delete();
