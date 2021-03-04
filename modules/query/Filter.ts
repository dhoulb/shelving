import type { Data } from "../data";
import { MATCH, Operator } from "../filter";
import { Rule } from "./Rule";
import { getQueryProp } from "./helpers";

/**
 * Filter: filters a list of documents.
 *
 * @param key The name of a property that might exist on documents in the collection.
 * @param type MatchType reference, e.g. `is` or `contains`
 * @param value Value the specified property should be matched against.
 */
export class Filter<T extends Data> extends Rule<T> {
	readonly key: "id" | string;
	readonly operator: Operator;
	readonly value: unknown;

	constructor(key: "id" | string, operator: Operator, value: unknown) {
		super();
		this.key = key;
		this.operator = operator;
		this.value = value;
	}

	match(id: string, data: T): boolean {
		return MATCH[this.operator](getQueryProp(id, data, this.key), this.value);
	}

	// Implement toString()
	toString(): string {
		return `${this.key}:${this.operator}=${JSON.stringify(this.value)}`;
	}
}
