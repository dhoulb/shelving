import type { ImmutableEntries } from "../entry";
import type { Data, Results } from "../data";
import { Rule } from "./Rule";

const JOIN_RULES = ",";

const getRuleString = (rule: Rule<Data>) => rule.toString();

/** Type of Rule that is powered by several sub-rules (e.g. `Filters` and `Sorts` and `Query` itself extend this). */
export abstract class Rules<T extends Data, C extends Rule<T>> extends Rule<T> {
	protected readonly rules: C[];

	get first(): C | undefined {
		return this.rules[0];
	}
	get last(): C | undefined {
		return this.rules[this.rules.length - 1];
	}
	get length(): number {
		return this.rules.length;
	}

	constructor(rules: C[] = []) {
		super();
		this.rules = rules;
	}

	/**
	 * Match an individual document against this rule.
	 */
	match(id: string, data: T): boolean {
		// If any rule returns false, return false.
		for (const rule of this.rules) if (!rule.match(id, data)) return false;
		return true;
	}

	/**
	 * Apply this queryable to a set of results and return the (potentially) modified results.
	 * @returns Either a new Results object (if `results` was modified), or the exact same instance (if no changes were made).
	 */
	results(results: Results<T>): Results<T> {
		if (!this.rules.length) return results;
		return super.results(results);
	}

	/**
	 * Modify an array of entries (in place, modifying the original object).
	 * @returns The new array, or the exact old array instance if no changes were made.
	 */
	apply(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!this.rules.length || !entries.length) return entries;
		// Push the list of entries through each of the rules (in order) and return the resulting entries.
		let applied = entries;
		for (const rule of this.rules) applied = rule.apply(applied);
		return applied;
	}

	// Implement iterator protocol.
	*[Symbol.iterator](): Generator<C, void, undefined> {
		yield* this.rules;
	}

	// Implement toString()
	toString(): string {
		return this.rules.map(getRuleString).join(JOIN_RULES);
	}
}
