import { Transform } from "./Transform.js";

/**
 * Increment transform: an object that increments/decrements a value.
 * - Hint: you can use negative numbers to decrement the number too!
 */
export class IncrementTransform extends Transform<number> {
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
export const INCREMENT = new IncrementTransform(1);

/** Transform that decrements a value by one. */
export const DECREMENT = new IncrementTransform(-1);
