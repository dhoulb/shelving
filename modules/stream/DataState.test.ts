import { initialState, State, DataState, ResultState, RequiredError, INCREMENT, Result } from "../index.js";

test("DataState.prototype.data", () => {
	type T = { a: number };
	const state = initialState({ a: 1 }, new DataState<T>());
	expect(state).toBeInstanceOf(DataState);
	expect(state.value).toEqual({ a: 1 });
	expect(state.data).toEqual({ a: 1 });
	// Ons and onces.
	const calls: T[] = [];
	state.subscribe(v => calls.push(v));
	// Set truthy value.
	expect(state.next({ a: 2 })).toBe(undefined);
	expect(state.value).toEqual({ a: 2 });
	expect(state.data).toEqual({ a: 2 });
	// Checks.
	expect(calls).toEqual([{ a: 1 }, { a: 2 }]);
});
test("DataState.prototype.update()", () => {
	type T = { a: number; b: number };
	const state = initialState({ a: 1, b: 2 }, new DataState<T>());
	expect(state).toBeInstanceOf(DataState);
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
test("ResultState.prototype.data", () => {
	type T = { a: number };
	const state = initialState(null, new ResultState<T>());
	expect(state).toBeInstanceOf(ResultState);
	expect(state.value).toEqual(null);
	expect(state.result).toEqual(null);
	expect(() => state.data).toThrow(RequiredError);
	// Ons and onces.
	const calls: Result<T>[] = [];
	state.subscribe(v => calls.push(v));
	// Set data value.
	expect(state.next({ a: 1 })).toBe(undefined);
	expect(state.value).toEqual({ a: 1 });
	expect(state.result).toEqual({ a: 1 });
	expect(state.data).toEqual({ a: 1 });
	// Update data value.
	expect(state.update({ a: INCREMENT })).toBe(undefined);
	expect(state.value).toEqual({ a: 2 });
	expect(state.result).toEqual({ a: 2 });
	expect(state.data).toEqual({ a: 2 });
	// Delete data value.
	expect(state.delete()).toBe(undefined);
	expect(state.value).toBe(null);
	expect(state.result).toBe(null);
	expect(() => state.data).toThrow(RequiredError);
	// Set null value.
	expect(state.next(null)).toBe(undefined);
	expect(state.value).toBe(null);
	expect(state.result).toBe(null);
	expect(() => state.data).toThrow(RequiredError);
	// Checks.
	expect(calls).toEqual([null, { a: 1 }, { a: 2 }, null]);
});
test("ResultState.prototype.update()", () => {
	type T = { a: number; b: number };
	const state = initialState({ a: 1, b: 2 }, new ResultState<T>());
	expect(state).toBeInstanceOf(ResultState);
	expect(state.value).toEqual({ a: 1, b: 2 });
	// Ons and onces.
	const calls1: Result<T>[] = [];
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
