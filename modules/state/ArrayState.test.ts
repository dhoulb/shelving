import type { ImmutableArray } from "../index.js";
import { ArrayState, runMicrotasks } from "../index.js";

test("ArrayState with initial value", async () => {
	const state = new ArrayState<number>([1, 2, 3]);
	expect(state).toBeInstanceOf(ArrayState);
	expect(state.value).toEqual([1, 2, 3]);
	// Ons and onces.
	const calls: ImmutableArray<number>[] = [];
	const stop = state.next.to(v => void calls.push(v));
	// Add.
	expect(state.add(4)).toBe(undefined);
	expect(state.value).toEqual([1, 2, 3, 4]);
	await runMicrotasks();
	expect(calls).toEqual([[1, 2, 3, 4]]);
	// Remove.
	expect(state.delete(2)).toBe(undefined);
	expect(state.value).toEqual([1, 3, 4]);
	await runMicrotasks();
	expect(calls).toEqual([
		[1, 2, 3, 4],
		[1, 3, 4],
	]);
	// Cleanup.
	stop();
});
