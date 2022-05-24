import type { Data } from "../util/data.js";
import { ImmutableArray, withItems, withoutItems } from "../util/array.js";
import { Rule } from "./Rule.js";

/** Type of Rule that is powered by several sub-rules (e.g. `Filters` and `Sorts` and `Query` itself extend this). */
export abstract class Rules<T extends Data, R extends Rule<T>> extends Rule<T> implements Iterable<R> {
	protected readonly _rules: ImmutableArray<R>;

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
		return this._rules.map(toString).join(",");
	}

	/** Clone this set of rules but add additional rules. */
	with(...rules: R[]): this {
		const _rules = withItems(this._rules, rules);
		return _rules !== this._rules ? { __proto__: Object.getPrototypeOf(this), ...this, _rules } : this;
	}

	/** Clone this set of rules but remove specific rules. */
	without(...rules: R[]): this {
		const _rules = withoutItems(this._rules, rules);
		return _rules !== this._rules ? { __proto__: Object.getPrototypeOf(this), ...this, _rules } : this;
	}

	/** Iterate over the rules. */
	[Symbol.iterator](): Iterator<R, void> {
		return this._rules.values();
	}
}
