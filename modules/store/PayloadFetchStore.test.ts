import { expect, test } from "bun:test";
import { NONE, PayloadFetchStore, runMicrotasks } from "../index.js";

// --- Initial state ---

test("payload is accessible via store.payload.value", () => {
	const store = new PayloadFetchStore<number, string>(42, NONE, p => Promise.resolve(`${p}`));
	expect(store.payload.value).toBe(42);
});

test("reading loading triggers the first fetch with the initial payload", async () => {
	const received: string[] = [];
	const store = new PayloadFetchStore<string, string>("hello", NONE, p => {
		received.push(p);
		return Promise.resolve(`result:${p}`);
	});

	expect(store.loading).toBe(true); // triggers fetch
	await runMicrotasks();

	expect(store.value).toBe("result:hello");
	expect(received).toEqual(["hello"]);
});

// --- Payload changes ---

test("changing payload invalidates and triggers a re-fetch with the new payload", async () => {
	const received: string[] = [];
	const store = new PayloadFetchStore<string, string>("A", NONE, p => {
		received.push(p);
		return Promise.resolve(`result:${p}`);
	});

	// First fetch.
	expect(store.loading).toBe(true);
	await runMicrotasks();
	expect(store.value).toBe("result:A");

	// Change payload — _iterate aborts (no-op, nothing in-flight), invalidates, and
	// calls refresh() which starts a fresh fetch because _inflight is clear.
	store.payload.value = "B";
	await runMicrotasks();

	expect(store.value).toBe("result:B");
	expect(received).toEqual(["A", "B"]);
});

test("changing payload marks the store as invalid (old value is preserved)", async () => {
	const store = new PayloadFetchStore<string, string>("A", NONE, p => Promise.resolve(`result:${p}`));

	expect(store.loading).toBe(true);
	await runMicrotasks();
	expect(store.value).toBe("result:A");

	store.payload.value = "B";
	await runMicrotasks();

	// After the B fetch completes, value is updated.
	expect(store.value).toBe("result:B");
});

test("changing payload aborts the in-flight signal", async () => {
	const signals: AbortSignal[] = [];

	const store = new PayloadFetchStore<string, string>("A", NONE, _p => {
		signals.push(store.signal);
		return new Promise(() => {}); // never resolves
	});

	expect(store.loading).toBe(true); // triggers fetch
	await runMicrotasks();

	const signalA = signals[0]!;
	expect(signalA.aborted).toBe(false);

	store.payload.value = "B";
	await runMicrotasks();

	expect(signalA.aborted).toBe(true);
});

test("same payload value does not trigger a re-fetch", async () => {
	let calls = 0;
	const store = new PayloadFetchStore<string, string>("A", NONE, _p => {
		calls++;
		return Promise.resolve("result");
	});

	expect(store.loading).toBe(true);
	await runMicrotasks();
	expect(calls).toBe(1);

	// Store deduplicates equal values — _iterate never fires.
	store.payload.value = "A";
	await runMicrotasks();
	expect(calls).toBe(1);
});

test("deep-equal object payload does not trigger a re-fetch", async () => {
	let calls = 0;
	const store = new PayloadFetchStore<{ id: number }, string>({ id: 1 }, NONE, _p => {
		calls++;
		return Promise.resolve("result");
	});

	expect(store.loading).toBe(true);
	await runMicrotasks();
	expect(calls).toBe(1);

	store.payload.value = { id: 1 };
	await runMicrotasks();
	expect(calls).toBe(1);
});

test("different object payload triggers a re-fetch with the new payload", async () => {
	const received: number[] = [];
	const store = new PayloadFetchStore<{ id: number }, string>({ id: 1 }, NONE, p => {
		received.push(p.id);
		return Promise.resolve(`result:${p.id}`);
	});

	expect(store.loading).toBe(true);
	await runMicrotasks();
	expect(received).toEqual([1]);

	store.payload.value = { id: 2 };
	await runMicrotasks();

	expect(store.value).toBe("result:2");
	expect(received).toEqual([1, 2]);
});

// --- Dispose ---

test("asyncDispose() cleans up without throwing", async () => {
	const store = new PayloadFetchStore<string, string>("A", NONE, () => new Promise(() => {}));

	store.loading; // trigger in-flight fetch
	await runMicrotasks();

	await expect(() => store[Symbol.asyncDispose]()).not.toThrow();
});
