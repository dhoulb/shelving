import { initialState, State, DataState } from "../index.js";

test("DataState.prototype.update()", () => {
	const state = initialState({ a: 1, b: 2 }, new DataState<{ a: number; b: number }>());
	expect(state).toBeInstanceOf(State);
	expect(state.value).toEqual({ a: 1, b: 2 });
	// Ons and onces.
	const fn1 = jest.fn<any, any>();
	state.subscribe(fn1);
	// Apply a data transform.
	expect(state.update({ a: 111, b: n => n * n })).toBe(undefined);
	expect(state.value).toEqual({ a: 111, b: 4 });
	// Apply a data transform that changes nothing.
	expect(state.update({})).toBe(undefined);
	expect(state.update({ a: 111 })).toBe(undefined);
	expect(state.value).toEqual({ a: 111, b: 4 });
	// Checks.
	expect(fn1.mock.calls).toEqual([[{ a: 1, b: 2 }], [{ a: 111, b: 4 }]]);
});
