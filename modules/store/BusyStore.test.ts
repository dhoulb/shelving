import { expect, test } from "bun:test";
import { BusyStore, getDeferred, NONE, runMicrotasks } from "../index.js";

test("busy is false initially", () => {
	const store = new BusyStore<number>(42);
	expect(store.busy.value).toBe(false);
});

test("await() sets busy to true", () => {
	const d = getDeferred<number>();
	const store = new BusyStore<number>(NONE);
	void store.await(d.promise);
	expect(store.busy.value).toBe(true);
});

test("busy is false after await() resolves", async () => {
	const d = getDeferred<number>();
	const store = new BusyStore<number>(NONE);
	void store.await(d.promise);
	d.resolve(42);
	await runMicrotasks();
	expect(store.busy.value).toBe(false);
	expect(store.value).toBe(42);
});

test("busy is false after await() rejects", async () => {
	const err = new Error("oops");
	const d = getDeferred<number>();
	const store = new BusyStore<number>(NONE);
	void store.await(d.promise);
	d.reject(err);
	await runMicrotasks();
	expect(store.busy.value).toBe(false);
	expect(store.reason).toBe(err);
});

test("abort() sets busy to false and discards the pending value", async () => {
	const d = getDeferred<number>();
	const store = new BusyStore<number>(NONE);
	void store.await(d.promise);
	expect(store.busy.value).toBe(true);
	store.abort();
	expect(store.busy.value).toBe(false);
	d.resolve(42);
	await runMicrotasks();
	expect(store.loading).toBe(true); // discarded — value was never written
});

test("writing a value while busy clears busy and discards the pending value", async () => {
	const d = getDeferred<number>();
	const store = new BusyStore<number>(NONE);
	void store.await(d.promise);
	expect(store.busy.value).toBe(true);
	store.value = 99;
	expect(store.busy.value).toBe(false);
	d.resolve(42); // late — discarded
	await runMicrotasks();
	expect(store.value).toBe(99);
});
