import type { Data } from "../util/data.js";
import { ImmutableArray, withItems, withoutItems } from "../util/array.js";
import { Constraint } from "./Constraint.js";

/** Type of Rule that is powered by several sub-constraints (e.g. `Filters` and `Sorts` and `Query` itself extend this). */
export abstract class Constraints<T extends Data, C extends Constraint<Partial<T>>> extends Constraint<T> implements Iterable<C> {
	protected readonly _constraints: ImmutableArray<C>;

	/** Get the first constraint. */
	get first(): C | undefined {
		return this._constraints[0];
	}

	/** Get the last constraint. */
	get last(): C | undefined {
		return this._constraints[this._constraints.length - 1];
	}

	/** Get the number of constraints. */
	get size(): number {
		return this._constraints.length;
	}

	constructor(...constraints: C[]) {
		super();
		this._constraints = constraints;
	}

	/** Clone this set of constraints but add additional constraints. */
	with(...constraints: C[]): this {
		const _constraints = withItems(this._constraints, constraints);
		return _constraints !== this._constraints ? { __proto__: Object.getPrototypeOf(this), ...this, _constraints: _constraints } : this;
	}

	/** Clone this set of constraints but remove specific constraints. */
	without(...constraints: C[]): this {
		const _constraints = withoutItems(this._constraints, constraints);
		return _constraints !== this._constraints ? { __proto__: Object.getPrototypeOf(this), ...this, _constraints: _constraints } : this;
	}

	/** Iterate over the constraints. */
	[Symbol.iterator](): Iterator<C, void> {
		return this._constraints.values();
	}
}
