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

test("reading value throws a promise while loading", () => {
	const store = new FetchStore<number>(NONE, () => new Promise(() => {}));

	store.refresh();

	try {
		store.value;
		expect.unreachable();
	} catch (thrown) {
		expect(thrown).toMatchObject(EXPECT_PROMISELIKE);
	}
});

test("busy is true while fetching and false after", async () => {
	const d = getDeferred<number>();
	const store = new FetchStore<number>(NONE, () => d.promise);

	expect(store.loading).toBe(true); // triggers fetch
	await runMicrotasks();

	expect(store.busy.value).toBe(true);

	d.resolve(42);
	await runMicrotasks();

	expect(store.value).toBe(42);
	expect(store.busy.value).toBe(false);
});

test("error in callback sets reason", async () => {
	const err = new Error("oops");
	const store = new FetchStore<number>(NONE, () => Promise.reject(err));

	store.refresh();
	await runMicrotasks();

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
	const store = new FetchStore<number>(NONE, () => new Promise(() => {}));

	store.refresh();
	await runMicrotasks();

	const signal = store.signal;
	expect(signal.aborted).toBe(false);

	store.abort();
	expect(signal.aborted).toBe(true);
});

test("abort() does not set reason", async () => {
	const store = new FetchStore<number>(NONE, () => new Promise(() => {}));

	store.refresh();
	await runMicrotasks();

	store.abort();
	await runMicrotasks();

	expect(store.reason).toBe(undefined);
});

test("a new signal is created after abort()", async () => {
	const store = new FetchStore<number>(NONE, () => new Promise(() => {}));

	store.refresh();
	await runMicrotasks();

	const signal1 = store.signal;
	store.abort();
	const signal2 = store.signal;

	expect(signal1).not.toBe(signal2);
	expect(signal1.aborted).toBe(true);
	expect(signal2.aborted).toBe(false);
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

test("stale-data protection: fetch that resolves after invalidate() applies the stale value but stays flagged for re-fetch", async () => {
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

	// Trigger fetch #2 explicitly (after the first fetch _invalid=false, so reading
	// loading won't re-trigger — call refresh() directly to start a second fetch).
	store.refresh();
	await runMicrotasks();
	expect(calls).toBe(2); // second fetch started

	// Invalidate while fetch #2 is still in-flight.
	store.invalidate();

	// Fetch #2 resolves — the stale value IS written (super.value = await value),
	// but _invalidation counter did not match so the store remains flagged.
	fetches[1]!.resolve(99);
	await runMicrotasks();

	// Stale value is visible; store is still flagged (_invalidation != 0).
	expect(store.value).toBe(99);
	// Reading loading confirms _invalidation is still set — triggers fetch #3.
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
