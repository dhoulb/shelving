import type { Data } from "../index.js";
import { DeferredSequence, runMicrotasks, runSequence } from "../index.js";
import { LazyDeferredSequence } from "./LazyDeferredSequence.js";

describe("LazyDeferredSequence", () => {
	test("Works the same as DeferredSequence", async () => {
		const deferred = new DeferredSequence<number>();
		// const deferred = new LazyDeferredSequence<number>(() => () => {});
		const calls: number[] = [];
		const errors: unknown[] = [];
		const stop = runSequence(
			deferred,
			v => calls.push(v),
			e => errors.push(e),
		);
		// Resolve and check.
		deferred.resolve(1);
		await runMicrotasks();
		expect(calls).toEqual([1]);
		// Resolve again and check.
		deferred.resolve(2);
		await runMicrotasks();
		expect(calls).toEqual([1, 2]);
		// Reject and check.
		deferred.reject("A");
		await runMicrotasks();
		expect(errors).toEqual(["A"]);
		// Reject again and check.
		deferred.reject("B");
		await runMicrotasks();
		expect(errors).toEqual(["A", "B"]);
		// Stop the subscription and resolve/reject new values.
		stop();
		// Resolve again and check.
		deferred.resolve(3);
		await runMicrotasks();
		expect(calls).toEqual([1, 2]);
		// Reject again and check.
		deferred.reject("C");
		await runMicrotasks();
		expect(errors).toEqual(["A", "B"]);
	});
	test("StartCallback is called", async () => {
		let started = false;
		const sequence = new LazyDeferredSequence<number>(() => {
			started = true;
			return () => {
				started = false;
			};
		});
		expect(started).toBe(false);
		const iterator1 = sequence[Symbol.asyncIterator]();
		setTimeout(() => sequence.resolve(1), 10);
		await iterator1.next();
		expect((sequence as unknown as Data)._iterating).toBe(1);
		expect(started).toBe(true);
		await iterator1.return();
		expect(started).toBe(false);
	});
});
