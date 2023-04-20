import { Feedback } from "../feedback/Feedback.js";
import { Schema } from "./Schema.js";
import { ThroughSchema } from "./ThroughSchema.js";

/** Validate a value of a specifed type, but return `Feedback` if the validated value is falsy. */
export class RequiredSchema<T> extends ThroughSchema<T> {
	override validate(unsafeValue: unknown): T {
		const safeValue = super.validate(unsafeValue);
		if (!safeValue) throw new Feedback("Required", safeValue);
		return safeValue;
	}
}

/** Create a new required schema from a source schema. */
export const REQUIRED = <T>(source: Schema<T>): RequiredSchema<T> => new RequiredSchema({ source });
