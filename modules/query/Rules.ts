import { Data, MutableArray, toString } from "../util/index.js";
import { Rule } from "./Rule.js";

/** Type of Rule that is powered by several sub-rules (e.g. `Filters` and `Sorts` and `Query` itself extend this). */
export abstract class Rules<T extends Data, R extends Rule<T>> extends Rule<T> implements Iterable<R> {
	protected readonly _rules: MutableArray<R>;

	/** Get the first rule. */
	get first(): R | undefined {
		return this._rules[0];
	}

	/** Get the last rule. */
	get last(): R | undefined {
		return this._rules[this._rules.length - 1];
	}

	/** Get the number of rules. */
	get size(): number {
		return this._rules.length;
	}

	constructor(...rules: R[]) {
		super();
		this._rules = rules;
	}
	toString(): string {
		return this._rules.map(toString).join("&");
	}

	/** Iterate over the rules. */
	[Symbol.iterator](): Iterator<R, void> {
		return this._rules.values();
	}
}
