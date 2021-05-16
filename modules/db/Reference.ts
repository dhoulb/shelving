import { ValidationError } from "../errors";
import { Feedback, InvalidFeedback, isFeedback } from "../feedback";
import type { Data, Results } from "../data";
import type { ImmutableObject, MutableObject } from "../object";
import type { Validator, ValidateOptions } from "../schema";
import type { Provider } from "./Provider";

/** Reference is a shared base for both Document and Documents that defines a single path in the database. */
export abstract class Reference<T extends Data> implements Validator<T> {
	/** Schema validator for this path. */
	readonly schema: Validator<T>;

	/** Provider that powers this path. */
	readonly provider: Provider;

	/** String path. */
	readonly path: string;

	protected constructor(schema: Validator<T>, provider: Provider, path: string) {
		this.schema = schema;
		this.provider = provider;
		this.path = path;
	}

	/** Validate a single document at this path. */
	validate(data: ImmutableObject, options?: ValidateOptions): T {
		try {
			return this.schema.validate(data, options);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ValidationError(`Invalid ${options?.partial ? "partial data" : "data"} for: "${this.path}"`, thrown);
			else throw thrown;
		}
	}

	/** Validate a set of documents at this path. */
	validateResults(results: ImmutableObject<ImmutableObject>): Results<T> {
		const validated: MutableObject<T> = {};
		const invalids: MutableObject<Feedback> = {};
		let invalid = false;
		for (const [id, data] of Object.entries(results)) {
			try {
				validated[id] = this.schema.validate(data);
			} catch (thrown) {
				if (isFeedback(thrown)) invalids[id] = thrown;
				else throw thrown;
				invalid = true;
			}
		}
		if (invalid) throw new ValidationError(`Invalid documents for: "${this.path}"`, new InvalidFeedback("Invalid documents", invalids));
		return validated;
	}

	// Implement toString()
	toString(): string {
		return this.path;
	}
}
