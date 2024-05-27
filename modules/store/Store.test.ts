import { expect, test } from "bun:test";
import { NONE, Store, runMicrotasks, runSequence } from "../index.js";
import { expectToThrowPromiseLike } from "../test/util.js";

test("No initial value", async () => {
	const store = new Store<number>(NONE);
	// SUbscribe.
	const calls1: number[] = [];
	const calls2: number[] = [];
	const stop1 = runSequence(store, v => calls1.push(v));
	const stop2 = runSequence(store.next, v => calls2.push(v));
	await runMicrotasks();
	// Get with no value throws promise.
	expect(store.loading).toBe(true);
	expectToThrowPromiseLike(() => store.value);
	// Set initial value.
	store.value = 111;
	expect(store.loading).toBe(false);
	expect(store.value).toBe(111);
	await runMicrotasks();
	// Set new value.
	store.value = 222;
	expect(store.value).toBe(222);
	await runMicrotasks();
	// Set new value.
	store.value = 333;
	expect(store.value).toBe(333);
	await runMicrotasks();
	// Set same value again.
	store.value = 333;
	expect(store.value).toBe(333);
	// Checks.
	expect(calls1).toEqual([111, 222, 333]);
	expect(calls2).toEqual([111, 222, 333]);
	// Cleanup.
	stop1();
	stop2();
	// Set new value.
	store.value = 555;
	expect(store.value).toBe(555);
	await runMicrotasks();
	// Checks.
	expect(calls1).toEqual([111, 222, 333]);
	expect(calls2).toEqual([111, 222, 333]);
});
test("Initial value", async () => {
	const store = new Store(111);
	expect(store).toBeInstanceOf(Store);
	expect(store.loading).toBe(false);
	expect(store.value).toBe(111);
	// Listeners.
	const calls1: number[] = [];
	const calls2: number[] = [];
	const stop1 = runSequence(store, v => calls1.push(v));
	const stop2 = runSequence(store.next, v => calls2.push(v));
	await runMicrotasks();
	// Set new value.
	store.value = 222;
	expect(store.value).toBe(222);
	await runMicrotasks();
	// Set new value.
	store.value = 333;
	expect(store.value).toBe(333);
	await runMicrotasks();
	// Set same value again.
	store.value = 333;
	expect(store.value).toBe(333);
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([111, 222, 333]);
	expect(calls2).toEqual([222, 333]);
	// Cleanup.
	stop1();
	stop2();
	// Set new value.
	store.value = 555;
	expect(store.value).toBe(555);
	await runMicrotasks();
	// Checks.
	expect(calls1).toEqual([111, 222, 333]);
	expect(calls2).toEqual([222, 333]);
});
test("Initial value and multiple synchronous `set()` calls", async () => {
	const store = new Store<number>(111);
	// Listeners.
	const calls1: number[] = [];
	const calls2: number[] = [];
	const stop1 = runSequence(store, v => calls1.push(v));
	const stop2 = runSequence(store.next, v => calls2.push(v));
	// Set multiple times.
	store.value = 222;
	store.value = 333;
	store.value = 444;
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([444]);
	expect(calls2).toEqual([444]);
	// Cleanup.
	stop1();
	stop2();
	// Set new value.
	store.value = 555;
	expect(store.value).toBe(555);
	await runMicrotasks();
	// Checks.
	expect(calls1).toEqual([444]);
	expect(calls2).toEqual([444]);
});
test("No initial value and multiple synchronous `set()` calls", async () => {
	const store = new Store<number>(NONE);
	// Listeners.
	const calls1: number[] = [];
	const calls2: number[] = [];
	const stop1 = runSequence(store, v => calls1.push(v));
	const stop2 = runSequence(store.next, v => calls2.push(v));
	// Set multiple times.
	store.value = 222;
	store.value = 333;
	store.value = 444;
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([444]);
	expect(calls2).toEqual([444]);
	// Cleanup.
	stop1();
	stop2();
	// Set new value.
	store.value = 555;
	expect(store.value).toBe(555);
	await runMicrotasks();
	// Checks.
	expect(calls1).toEqual([444]);
	expect(calls2).toEqual([444]);
});
