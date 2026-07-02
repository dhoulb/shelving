import { expect, test } from "bun:test";
import { ArrayStore } from "shelving/store";
import type { ImmutableArray } from "shelving/util/array";
import { runMicrotasks } from "shelving/util/async";
import { runSequence } from "shelving/util/sequence";

test("ArrayStore with initial value", async () => {
	const store = new ArrayStore<number>([1, 2, 3]);
	expect(store).toBeInstanceOf(ArrayStore);
	expect(store.value).toEqual([1, 2, 3]);
	// Ons and onces.
	const calls: ImmutableArray<number>[] = [];
	const stop = runSequence(store.next, v => void calls.push(v));
	// Add.
	expect(store.add(4)).toBe(undefined);
	expect(store.value).toEqual([1, 2, 3, 4]);
	await runMicrotasks();
	expect(calls).toEqual([[1, 2, 3, 4]]);
	// Remove.
	expect(store.delete(2)).toBe(undefined);
	expect(store.value).toEqual([1, 3, 4]);
	await runMicrotasks();
	expect(calls).toEqual([
		[1, 2, 3, 4],
		[1, 3, 4],
	]);
	// Cleanup.
	stop();
});
