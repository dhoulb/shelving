import { describe, expect, test } from "bun:test";
import { InspectSequence } from "../index.js";

// Build an `InspectSequence` wrapping a simple async generator source.
async function* _numbers(): AsyncGenerator<number, string, undefined> {
	yield 1;
	yield 2;
	yield 3;
	return "done";
}

describe("InspectSequence", () => {
	test("captures first/last/count as values pass through", async () => {
		const sequence = new InspectSequence(_numbers());

		// Nothing iterated yet.
		expect(sequence.count).toBe(0);
		expect(sequence.done).toBe(false);
		expect(() => sequence.first).toThrow("Iteration not started");
		expect(() => sequence.last).toThrow("Iteration not started");

		// First value — must not throw while `_first` is still unset.
		const r1 = await sequence.next();
		expect(r1).toEqual({ value: 1, done: false });
		expect(sequence.first).toBe(1);
		expect(sequence.last).toBe(1);
		expect(sequence.count).toBe(1);

		// Subsequent values advance `last`/`count` but keep `first`.
		await sequence.next();
		const r3 = await sequence.next();
		expect(r3).toEqual({ value: 3, done: false });
		expect(sequence.first).toBe(1);
		expect(sequence.last).toBe(3);
		expect(sequence.count).toBe(3);

		// Return value is captured when the source finishes.
		const rEnd = await sequence.next();
		expect(rEnd.done).toBe(true);
		expect(sequence.done).toBe(true);
		expect(sequence.returned).toBe("done");
		expect(sequence.count).toBe(3);
	});
});
