import { jest } from "@jest/globals";
import { initialState, State, DataState } from "../index.js";

test("DataState.prototype.update()", () => {
	type T = { a: number; b: number };
	const state = initialState({ a: 1, b: 2 }, new DataState<T>());
	expect(state).toBeInstanceOf(State);
	expect(state.value).toEqual({ a: 1, b: 2 });
	// Ons and onces.
	const calls1: T[] = [];
	state.subscribe(v => calls1.push(v));
	// Apply a data transform.
	expect(state.update({ a: 111, b: n => n * n })).toBe(undefined);
	expect(state.value).toEqual({ a: 111, b: 4 });
	// Apply a data transform that changes nothing.
	// expect(state.update({})).toBe(undefined);
	// expect(state.update({ a: 111 })).toBe(undefined);
	// expect(state.value).toEqual({ a: 111, b: 4 });
	// Checks.
	expect(calls1).toEqual([
		{ a: 1, b: 2 },
		{ a: 111, b: 4 },
	]);
});
