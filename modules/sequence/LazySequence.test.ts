import { describe, expect, test } from "bun:test";
import { DeferredSequence } from "../index.js";
import { LazySequence } from "./LazySequence.js";

describe("LazySequence", () => {
	test("StartCallback is called", async () => {
		let started = false;
		const deferred = new DeferredSequence<number>();
		const sequence = new LazySequence(deferred, () => {
			started = true;
			return () => {
				started = false;
			};
		});
		expect(started).toBe(false);
		const iterator1 = sequence[Symbol.asyncIterator]();
		setTimeout(() => deferred.resolve(1), 10);
		await iterator1.next();
		expect(sequence.iterators).toBe(1);
		expect(started).toBe(true);
		await iterator1.return?.();
		expect(started).toBe(false);
	});
});
