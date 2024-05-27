import { expect, test } from "bun:test";
import { runMicrotasks, runSequence } from "../index.js";
import { DeferredSequence } from "./DeferredSequence.js";

test("Multiple `resolve()` and `reject()` calls", async () => {
	const deferred = new DeferredSequence<number>();
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
test("Multiple synchronous `resolve()` calls", async () => {
	const deferred = new DeferredSequence<number>();
	const calls: number[] = [];
	const stop = runSequence(deferred, v => {
		calls.push(v);
	});
	// Resolve.
	deferred.resolve(1);
	deferred.resolve(2);
	deferred.resolve(3);
	deferred.resolve(4);
	deferred.resolve(5);
	// Check before microtasks.
	expect(calls).toEqual([]);
	// Check after microtasks.
	await runMicrotasks();
	expect(calls).toEqual([5]); // Resolves once to the last value.
});
