import { jest } from "@jest/globals";
import { ArrayState, initialState } from "../index.js";

test("ArrayState", () => {
	const state = initialState([1, 2, 3], new ArrayState<number>());
	expect(state).toBeInstanceOf(ArrayState);
	expect(state.value).toEqual([1, 2, 3]);
	// Ons and onces.
	const fn1 = jest.fn();
	state.subscribe(fn1);
	expect(fn1).nthCalledWith(1, [1, 2, 3]);
	// Has.
	expect(state.value.includes(1)).toBe(true);
	expect(state.value.includes(2)).toBe(true);
	expect(state.value.includes(3)).toBe(true);
	expect(state.value.includes(4)).toBe(false);
	// Add.
	expect(state.add(4)).toBe(undefined);
	expect(state.value).toEqual([1, 2, 3, 4]);
	expect(fn1).nthCalledWith(2, [1, 2, 3, 4]);
	// Remove.
	expect(state.delete(2)).toBe(undefined);
	expect(state.value).toEqual([1, 3, 4]);
	expect(fn1).nthCalledWith(3, [1, 3, 4]);
	// Has.
	expect(state.value.includes(1)).toBe(true);
	expect(state.value.includes(2)).toBe(false);
	expect(state.value.includes(3)).toBe(true);
	expect(state.value.includes(4)).toBe(true);
});
