import { expect, test } from "bun:test";
import { type Deferred, FetchStore, getDeferred, NONE, runMicrotasks } from "../index.js";
import { EXPECT_PROMISELIKE } from "../test/util.js";

// --- Basic fetch ---

test("value is loading before first fetch", () => {
	const store = new FetchStore<number>(NONE, () => Promise.resolve(1));
	expect(store.loading).toBe(true);
});

test("reading loading triggers a fetch", async () => {
	let calls = 0;
	const store = new FetchStore<number>(NONE, () => Promise.resolve(++calls));

	expect(store.loading).toBe(true); // triggers fetch
	await runMicrotasks();

	expect(store.value).toBe(1);
	expect(calls).toBe(1);
});

test("reading value throws a promise while loading", async () => {
	const store = new FetchStore<number>(NONE, () => Promise.resolve(123));

	const r = store.refresh();

	try {
		store.value;
		expect.unreachable();
	} catch (thrown) {
		expect(thrown).toMatchObject(EXPECT_PROMISELIKE);
	}

	await r;
});

test("error in callback sets reason", async () => {
	const err = new Error("oops");
	const store = new FetchStore<number>(NONE, () => Promise.reject(err));

	const result = await store.refresh();

	expect(result).toBe(false);
	expect(store.reason).toBe(err);
});

// --- refresh() deduplication ---

test("concurrent refresh() calls share the same in-flight promise", async () => {
	let calls = 0;
	const store = new FetchStore<number>(NONE, () => Promise.resolve(++calls));

	const p1 = store.refresh();
	const p2 = store.refresh();
	const p3 = store.refresh();

	expect(p1).toBe(p2);
	expect(p2).toBe(p3);

	await p1;
	expect(calls).toBe(1);
});

test("a new refresh() can start once the previous one settles", async () => {
	let calls = 0;
	const store = new FetchStore<number>(NONE, () => Promise.resolve(++calls));

	await store.refresh();
	await store.refresh(); // new fetch — _inflight was cleared

	expect(calls).toBe(2);
});

// --- abort() ---

test("abort() marks the current signal as aborted", async () => {
	const store = new FetchStore<number>(NONE, () => Promise.resolve(123));

	const r = store.refresh();

	const signal = store.signal;
	expect(signal.aborted).toBe(false);

	store.abort();
	expect(signal.aborted).toBe(true);

	await r;
});

test("abort() does not set reason", async () => {
	const store = new FetchStore<number>(NONE, () => Promise.resolve(123));

	const r = store.refresh();

	store.abort();

	await r;

	expect(store.reason).toBe(undefined);
});

test("a new signal is created after abort()", async () => {
	const store = new FetchStore<number>(NONE, () => Promise.resolve(123));

	const r = store.refresh();

	const signal1 = store.signal;
	store.abort();
	const signal2 = store.signal;

	expect(signal1).not.toBe(signal2);
	expect(signal1.aborted).toBe(true);
	expect(signal2.aborted).toBe(false);

	await r;
});

// --- invalidate() ---

test("invalidate() keeps the current value and sets _invalid, but loading stays false", async () => {
	let calls = 0;
	const store = new FetchStore<number>(NONE, () => Promise.resolve(++calls));

	expect(store.loading).toBe(true);
	await runMicrotasks();
	expect(store.value).toBe(1);

	store.invalidate();

	// Value is preserved — loading is still false.
	expect(store.loading).toBe(false);
	expect(store.value).toBe(1);
});

test("reading loading after invalidate() triggers a background re-fetch", async () => {
	let calls = 0;
	const store = new FetchStore<number>(NONE, () => Promise.resolve(++calls));

	expect(store.loading).toBe(true);
	await runMicrotasks();
	expect(store.value).toBe(1);

	store.invalidate();

	// Reading loading triggers background re-fetch (returns false since value exists).
	expect(store.loading).toBe(false);
	await runMicrotasks();

	expect(store.value).toBe(2);
	expect(calls).toBe(2);
});

test("stale-data protection: fetch that resolves after invalidate() is discarded; re-fetch produces fresh value", async () => {
	let calls = 0;
	const fetches: Array<Deferred<number>> = [];
	const store = new FetchStore<number>(NONE, () => {
		calls++;
		const d = getDeferred<number>();
		fetches.push(d);
		return d.promise;
	});

	// Seed the store with an initial value.
	expect(store.loading).toBe(true); // triggers fetch #1
	await runMicrotasks();
	fetches[0]!.resolve(1);
	await runMicrotasks();
	expect(store.value).toBe(1);

	// Trigger fetch #2 explicitly.
	void store.refresh();
	expect(calls).toBe(2); // second fetch started

	// Invalidate while fetch #2 is still in-flight — aborts it and marks stale.
	store.invalidate();

	// Fetch #2 resolves but is discarded (abort() cleared _pendingValue).
	fetches[1]!.resolve(99);
	await runMicrotasks();

	// Value is unchanged — the aborted fetch result was discarded.
	expect(store.value).toBe(1);
	// Reading loading with _invalidation set triggers fetch #3.
	expect(store.loading).toBe(false); // loading=false because value exists
	await runMicrotasks(); // fetch #3 triggered by the loading read above
	fetches[2]!.resolve(2);
	await runMicrotasks();
	expect(store.value).toBe(2); // fresh fetch applied correctly
	expect(calls).toBe(3);
});

// --- refreshStale() ---

test("refreshStale() fetches when the store has never loaded", async () => {
	let calls = 0;
	const store = new FetchStore<number>(NONE, () => Promise.resolve(++calls));

	await store.refreshStale(1000);
	expect(calls).toBe(1);
});

test("refreshStale() does not re-fetch when value is fresh", async () => {
	let calls = 0;
	const store = new FetchStore<number>(NONE, () => Promise.resolve(++calls));

	await store.refreshStale(1000);
	expect(calls).toBe(1);

	await store.refreshStale(1000);
	expect(calls).toBe(1); // not stale yet
});

test("refreshStale() re-fetches after invalidate()", async () => {
	let calls = 0;
	const store = new FetchStore<number>(NONE, () => Promise.resolve(++calls));

	await store.refreshStale(1000);
	expect(calls).toBe(1);

	store.invalidate();
	await store.refreshStale(1000);
	expect(calls).toBe(2);
});
