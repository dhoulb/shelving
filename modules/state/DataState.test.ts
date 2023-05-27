import { DataState, OptionalDataState, RequiredError, runMicrotasks } from "../index.js";

test("DataState.prototype.data", async () => {
	type T = { a: number };
	const state = new DataState<T>({ value: { a: 1 } });
	expect(state).toBeInstanceOf(DataState);
	expect(state.value).toEqual({ a: 1 });
	expect(state.data).toEqual({ a: 1 });
	// Ons and onces.
	const calls: T[] = [];
	const stop = state.next.to(v => calls.push(v));
	// Set truthy value.
	state.value = { a: 2 };
	expect(state.value).toEqual({ a: 2 });
	expect(state.data).toEqual({ a: 2 });
	// Checks.
	await runMicrotasks();
	expect(calls).toEqual([{ a: 2 }]);
	// Cleanup.
	stop();
});
test("DataState.prototype.update()", async () => {
	type T = { a: number; b: number };
	const state = new DataState<T>({ value: { a: 1, b: 2 } });
	expect(state).toBeInstanceOf(DataState);
	expect(state.value).toEqual({ a: 1, b: 2 });
	// Ons and onces.
	const calls1: T[] = [];
	const stop = state.next.to(v => calls1.push(v));
	// Apply a data transform.
	expect(state.update({ "a": 111, "+=b": 100 })).toBe(undefined);
	expect(state.value).toEqual({ a: 111, b: 102 });
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([{ a: 111, b: 102 }]);
	// Cleanup.
	stop();
});
test("OptionalDataState.prototype.data", async () => {
	type T = { a: number };
	const state = new OptionalDataState<T>({ value: undefined });
	expect(state).toBeInstanceOf(OptionalDataState);
	expect(state.value).toEqual(undefined);
	expect(() => state.data).toThrow(RequiredError);
	// Ons and onces.
	const calls: (T | undefined)[] = [];
	const stop = state.next.to(v => calls.push(v));
	// Set data value.
	state.value = { a: 1 };
	expect(state.value).toEqual({ a: 1 });
	expect(state.data).toEqual({ a: 1 });
	// Update data value.
	expect(state.update({ "+=a": 1 })).toBe(undefined);
	expect(state.value).toEqual({ a: 2 });
	expect(state.data).toEqual({ a: 2 });
	// Delete data value.
	expect(state.unset()).toBe(undefined);
	expect(state.value).toBe(undefined);
	expect(() => state.data).toThrow(RequiredError);
	// Set undefined value.
	state.value = undefined;
	expect(state.value).toBe(undefined);
	expect(() => state.data).toThrow(RequiredError);
	// Checks.
	await runMicrotasks();
	expect(calls).toEqual([undefined]);
	// Cleanup.
	stop();
});
test("OptionalDataState.prototype.update()", async () => {
	type T = { a: number; b: number };
	const state = new OptionalDataState<T>({ value: { a: 1, b: 2 } });
	expect(state).toBeInstanceOf(OptionalDataState);
	expect(state.value).toEqual({ a: 1, b: 2 });
	// Ons and onces.
	const calls1: (T | undefined)[] = [];
	const stop = state.next.to(v => calls1.push(v));
	// Apply a data transform.
	expect(state.update({ "a": 111, "-=b": 100 })).toBe(undefined);
	expect(state.value).toEqual({ a: 111, b: -98 });
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([{ a: 111, b: -98 }]);
	// Cleanup.
	stop();
});
