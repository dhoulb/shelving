import { describe, expect, test } from "bun:test";
import { getDeferred, NONE, runMicrotasks, runSequence, Store } from "../index.js";
import { EXPECT_PROMISELIKE } from "../test/util.js";

test("No initial value", async () => {
	const store = new Store<number>(NONE);
	// Subscribe.
	const calls1: number[] = [];
	const calls2: number[] = [];
	const stop1 = runSequence(store, v => void calls1.push(v));
	const stop2 = runSequence(store.next, v => void calls2.push(v));
	await runMicrotasks();
	// Get with no value throws promise.
	expect(store.loading).toBe(true);
	try {
		store.value;
		expect.unreachable();
	} catch (thrown) {
		expect(thrown).toMatchObject(EXPECT_PROMISELIKE);
	}
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
	const stop1 = runSequence(store, v => void calls1.push(v));
	const stop2 = runSequence(store.next, v => void calls2.push(v));
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
	const stop1 = runSequence(store, v => void calls1.push(v));
	const stop2 = runSequence(store.next, v => void calls2.push(v));
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
	const stop1 = runSequence(store, v => void calls1.push(v));
	const stop2 = runSequence(store.next, v => void calls2.push(v));
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

// --- await() ---

describe("await() resolves and rejects correctly", () => {
	test("resolved value is applied to the store", async () => {
		const store = new Store<number>(NONE);
		const result = await store.await(Promise.resolve(42));
		expect(result).toBe(true);
		expect(store.value).toBe(42);
	});

	test("rejected error is stored as reason", async () => {
		const err = new Error("fail");
		const store = new Store<number>(NONE);
		const result = await store.await(Promise.reject(err));
		expect(result).toBe(false);
		expect(store.reason).toBe(err);
	});

	test("loading reflects pending state throughout", async () => {
		const d = getDeferred<number>();
		const store = new Store<number>(NONE);
		expect(store.loading).toBe(true);
		const p = store.await(d.promise);
		expect(store.loading).toBe(true); // still no value
		d.resolve(42);
		await p;
		expect(store.loading).toBe(false); // value applied
		expect(store.value).toBe(42);
	});
});

describe("await() abort", () => {
	test("abort() discards a result that arrives after the abort", async () => {
		const d = getDeferred<number>();
		const store = new Store<number>(NONE);
		const awaitResult = store.await(d.promise);
		store.abort();
		d.resolve(42); // arrives after abort — should be discarded
		const result = await awaitResult;
		expect(result).toBe(false);
		expect(store.loading).toBe(true); // value was discarded
	});

	test("setting a new value discards a pending await result", async () => {
		const d = getDeferred<number>();
		const store = new Store<number>(NONE);
		const awaitResult = store.await(d.promise);
		store.value = 99; // explicit set cancels the pending await
		d.resolve(42); // arrives after value was set — should be discarded
		const result = await awaitResult;
		expect(result).toBe(false);
		expect(store.value).toBe(99); // explicit value preserved
	});
});

// --- call() sync ---

describe("call() synchronous", () => {
	test("return value of callback is set as value", () => {
		const store = new Store<number>(NONE);
		void store.call(() => 42);
		expect(store.value).toBe(42);
	});

	test("additional args are passed to the callback", () => {
		const store = new Store<number>(NONE);
		void store.call((x: number, y: number) => x + y, 20, 22);
		expect(store.value).toBe(42);
	});

	test("thrown error is stored as reason", () => {
		const err = new Error("oops");
		const store = new Store<number>(NONE);
		void store.call(() => {
			throw err;
		});
		expect(store.reason).toBe(err);
	});

	test("returns true when callback succeeds", () => {
		const store = new Store<number>(NONE);
		const result = store.call(() => 42);
		expect(result).toBe(true);
	});

	test("returns false when callback throws", () => {
		const store = new Store<number>(NONE);
		const result = store.call(() => {
			throw new Error("oops");
		});
		expect(result).toBe(false);
	});
});

// --- call() async ---

describe("call() asynchronous", () => {
	test("resolved value of async callback is set as value", async () => {
		const store = new Store<number>(NONE);
		await store.call(async () => 42);
		expect(store.value).toBe(42);
	});

	test("additional args are passed to the async callback", async () => {
		const store = new Store<number>(NONE);
		await store.call(async (x: number, y: number) => x + y, 20, 22);
		expect(store.value).toBe(42);
	});

	test("rejected async callback stores error as reason", async () => {
		const err = new Error("oops");
		const store = new Store<number>(NONE);
		await store.call(async () => {
			throw err;
		});
		expect(store.reason).toBe(err);
	});

	test("returns Promise<true> when async callback resolves", async () => {
		const store = new Store<number>(NONE);
		const result = await store.call(async () => 42);
		expect(result).toBe(true);
	});

	test("returns Promise<false> when async callback rejects", async () => {
		const store = new Store<number>(NONE);
		const result = await store.call(async () => {
			throw new Error("oops");
		});
		expect(result).toBe(false);
	});

	test("returns Promise<false> when aborted before result arrives", async () => {
		const d = getDeferred<number>();
		const store = new Store<number>(NONE);
		const callResult = store.call(() => d.promise);
		store.abort();
		d.resolve(99);
		const result = await callResult;
		expect(result).toBe(false);
		expect(store.loading).toBe(true); // value was discarded
	});
});
