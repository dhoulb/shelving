import { Update } from "./Update.js";

/**
 * Increment transform: an object that increments/decrements a value.
 * - Hint: you can use negative numbers to decrement the number too!
 */
export class Increment extends Update<number> {
	readonly amount: number;
	constructor(amount: number) {
		super();
		this.amount = amount;
	}
	transform(existing?: unknown): number {
		return typeof existing === "number" ? existing + this.amount : this.amount;
	}
}

/** Transform that increments a value by one. */
export const INCREMENT = new Increment(1);

/** Transform that increments a value by a specific amount. */
export const INCREMENT_BY = (amount: number): Increment => new Increment(amount);

/** Transform that decrements a value by one. */
export const DECREMENT = new Increment(-1);

/** Transform that decrements a value by a specific amount. */
export const DECREMENT_BY = (amount: number): Increment => new Increment(0 - amount);
