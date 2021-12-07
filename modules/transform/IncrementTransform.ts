import { Transform } from "./Transform.js";

/**
 * Increment transform: an object that increments/decrements a value.
 * - Hint: you can use negative numbers to decrement the number too!
 */
export class IncrementTransform extends Transform<number> {
	static INCREMENT_ONE = new IncrementTransform(1);
	static DECREMENT_ONE = new IncrementTransform(-1);
	readonly amount: number;
	constructor(amount: number) {
		super();
		this.amount = amount;
	}
	transform(existing?: unknown): number {
		return typeof existing === "number" ? existing + this.amount : this.amount;
	}
}
