import { expect, test } from "bun:test";
import { DataStore, NotFoundError, OptionalDataStore, runMicrotasks, runSequence } from "../index.js";

test("DataStore.prototype.data", async () => {
	type T = { a: number };
	const store = new DataStore<T>({ a: 1 });
	expect(store).toBeInstanceOf(DataStore);
	expect(store.value).toEqual({ a: 1 });
	expect(store.data).toEqual({ a: 1 });
	// Ons and onces.
	const calls: T[] = [];
	const stop = runSequence(store.next, v => calls.push(v));
	// Set truthy value.
	store.value = { a: 2 };
	expect(store.value).toEqual({ a: 2 });
	expect(store.data).toEqual({ a: 2 });
	// Checks.
	await runMicrotasks();
	expect(calls).toEqual([{ a: 2 }]);
	// Cleanup.
	stop();
});
test("DataStore.prototype.update()", async () => {
	type T = { a: number; b: number };
	const store = new DataStore<T>({ a: 1, b: 2 });
	expect(store).toBeInstanceOf(DataStore);
	expect(store.value).toEqual({ a: 1, b: 2 });
	// Ons and onces.
	const calls1: T[] = [];
	const stop = runSequence(store.next, v => calls1.push(v));
	// Apply a data transform.
	expect(store.update({ a: 111, "+=b": 100 })).toBe(undefined);
	expect(store.value).toEqual({ a: 111, b: 102 });
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([{ a: 111, b: 102 }]);
	// Cleanup.
	stop();
});
test("OptionalDataStore.prototype.data", async () => {
	type T = { a: number };
	const store = new OptionalDataStore<T>(undefined);
	expect(store).toBeInstanceOf(OptionalDataStore);
	expect<T | undefined>(store.value).toEqual(undefined);
	expect(() => store.data).toThrow(NotFoundError);
	// Ons and onces.
	const calls: (T | undefined)[] = [];
	const stop = runSequence(store.next, v => calls.push(v));
	// Set data value.
	store.value = { a: 1 };
	expect(store.value).toEqual({ a: 1 });
	expect(store.data).toEqual({ a: 1 });
	// Update data value.
	expect(store.update({ "+=a": 1 })).toBe(undefined);
	expect(store.value).toEqual({ a: 2 });
	expect(store.data).toEqual({ a: 2 });
	// Delete data value.
	expect(store.unset()).toBe(undefined);
	expect<T | undefined>(store.value).toBe(undefined);
	expect(() => store.data).toThrow(NotFoundError);
	// Set undefined value.
	store.value = undefined;
	expect(store.value).toBe(undefined);
	expect(() => store.data).toThrow(NotFoundError);
	// Checks.
	await runMicrotasks();
	expect(calls).toEqual([undefined]);
	// Cleanup.
	stop();
});
test("OptionalDataStore.prototype.update()", async () => {
	type T = { a: number; b: number };
	const store = new OptionalDataStore<T>({ a: 1, b: 2 });
	expect(store).toBeInstanceOf(OptionalDataStore);
	expect(store.value).toEqual({ a: 1, b: 2 });
	// Ons and onces.
	const calls1: (T | undefined)[] = [];
	const stop = runSequence(store.next, v => calls1.push(v));
	// Apply a data transform.
	expect(store.update({ a: 111, "-=b": 100 })).toBe(undefined);
	expect(store.value).toEqual({ a: 111, b: -98 });
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([{ a: 111, b: -98 }]);
	// Cleanup.
	stop();
});
