import { DataState, OptionalDataState, RequiredError, INCREMENT, OptionalData, runMicrotasks } from "../index.js";

test("DataState.prototype.data", async () => {
	type T = { a: number };
	const state = new DataState<T>({ a: 1 });
	expect(state).toBeInstanceOf(DataState);
	expect(state.value).toEqual({ a: 1 });
	expect(state.data).toEqual({ a: 1 });
	// Ons and onces.
	const calls: T[] = [];
	const stop = state.next.subscribe(v => calls.push(v));
	// Set truthy value.
	expect(state.set({ a: 2 })).toBe(undefined);
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
	const state = new DataState<T>({ a: 1, b: 2 });
	expect(state).toBeInstanceOf(DataState);
	expect(state.value).toEqual({ a: 1, b: 2 });
	// Ons and onces.
	const calls1: T[] = [];
	const stop = state.next.subscribe(v => calls1.push(v));
	// Apply a data transform.
	expect(state.update({ a: 111, b: n => n * n })).toBe(undefined);
	expect(state.value).toEqual({ a: 111, b: 4 });
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([{ a: 111, b: 4 }]);
	// Cleanup.
	stop();
});
test("OptionalDataState.prototype.data", async () => {
	type T = { a: number };
	const state = new OptionalDataState<T>(null);
	expect(state).toBeInstanceOf(OptionalDataState);
	expect(state.value).toEqual(null);
	expect(() => state.data).toThrow(RequiredError);
	// Ons and onces.
	const calls: OptionalData<T>[] = [];
	const stop = state.next.subscribe(v => calls.push(v));
	// Set data value.
	expect(state.set({ a: 1 })).toBe(undefined);
	expect(state.value).toEqual({ a: 1 });
	expect(state.data).toEqual({ a: 1 });
	// Update data value.
	expect(state.update({ a: INCREMENT })).toBe(undefined);
	expect(state.value).toEqual({ a: 2 });
	expect(state.data).toEqual({ a: 2 });
	// Delete data value.
	expect(state.unset()).toBe(undefined);
	expect(state.value).toBe(null);
	expect(() => state.data).toThrow(RequiredError);
	// Set null value.
	expect(state.set(null)).toBe(undefined);
	expect(state.value).toBe(null);
	expect(() => state.data).toThrow(RequiredError);
	// Checks.
	await runMicrotasks();
	expect(calls).toEqual([null]);
	// Cleanup.
	stop();
});
test("OptionalDataState.prototype.update()", async () => {
	type T = { a: number; b: number };
	const state = new OptionalDataState<T>({ a: 1, b: 2 });
	expect(state).toBeInstanceOf(OptionalDataState);
	expect(state.value).toEqual({ a: 1, b: 2 });
	// Ons and onces.
	const calls1: OptionalData<T>[] = [];
	const stop = state.next.subscribe(v => calls1.push(v));
	// Apply a data transform.
	expect(state.update({ a: 111, b: n => n * n })).toBe(undefined);
	expect(state.value).toEqual({ a: 111, b: 4 });
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([{ a: 111, b: 4 }]);
	// Cleanup.
	stop();
});
