import { describe, expect, test } from "bun:test";
import { DBProvider, MemoryDBProvider, QueryStore, ThroughDBProvider } from "shelving/db";
import { UnsupportedError } from "shelving/error";
import { runMicrotasks } from "shelving/util/async";
import { runSequence } from "shelving/util/sequence";
import { BASICS_COLLECTION, type BasicData, type BasicItem, basic1 } from "../../test/index.js";

const _basic = (id: string, num: number): BasicItem => ({ ...basic1, id, num });
const ITEMS = [_basic("c", 5), _basic("b", 5), _basic("a", 1)];
const _ids = (store: QueryStore<string, BasicData>) => store.value.map(({ id }) => id);

describe("QueryStore with a MemoryDBProvider", () => {
	test("is loading while the memory has no items and no time for the query", () => {
		const memory = new MemoryDBProvider<string>();
		const store = new QueryStore(BASICS_COLLECTION, { str: "aaa" }, memory);
		expect(store.age).toBe(Number.POSITIVE_INFINITY);
	});
	test("seeds from the memory when it has items for the query", () => {
		const memory = new MemoryDBProvider<string>();
		memory.getTable(BASICS_COLLECTION).setItems(ITEMS);
		const store = new QueryStore(BASICS_COLLECTION, { num: 5, $order: "id" }, memory);
		expect(_ids(store)).toEqual(["b", "c"]);
	});
	test("seeds from a memory that a wrapping provider wraps", () => {
		const memory = new MemoryDBProvider<string>();
		memory.getTable(BASICS_COLLECTION).setItems(ITEMS);
		const store = new QueryStore(BASICS_COLLECTION, { num: 5, $order: "id" }, new ThroughDBProvider(memory));
		expect(_ids(store)).toEqual(["b", "c"]);
	});
	test("seeds as empty when the memory has a time for the query", () => {
		const memory = new MemoryDBProvider<string>();
		memory.getTable(BASICS_COLLECTION).setQueryTime({ str: "aaa" });
		const store = new QueryStore(BASICS_COLLECTION, { str: "aaa" }, memory);
		expect(_ids(store)).toEqual([]);
	});
	test("a fetch waits until the memory loads the query", async () => {
		const memory = new MemoryDBProvider<string>();
		const store = new QueryStore(BASICS_COLLECTION, { str: "aaa" }, memory);
		const refresh = store.refresh();
		await runMicrotasks();
		expect(store.age).toBe(Number.POSITIVE_INFINITY);
		memory.getTable(BASICS_COLLECTION).setQueryTime({ str: "aaa" }); // Loaded with no items.
		await refresh;
		expect(_ids(store)).toEqual([]);
	});
	test("follows the memory once the query loads", async () => {
		const memory = new MemoryDBProvider<string>();
		const store = new QueryStore(BASICS_COLLECTION, { num: 5, $order: "id" }, memory);
		const stop = runSequence(store);
		await runMicrotasks();
		expect(store.age).toBe(Number.POSITIVE_INFINITY);
		memory.getTable(BASICS_COLLECTION).setItems(ITEMS);
		await runMicrotasks();
		expect(_ids(store)).toEqual(["b", "c"]);
		memory.getTable(BASICS_COLLECTION).deleteItem("b");
		await runMicrotasks();
		expect(_ids(store)).toEqual(["c"]);
		stop();
	});
});

describe("QueryStore with another provider", () => {
	/** A memory that does not look like a `MemoryDBProvider`, and does not support subscriptions. */
	function _getRemote(): DBProvider<string> {
		const memory = new MemoryDBProvider<string>();
		memory.getTable(BASICS_COLLECTION).setItems(ITEMS);
		const remote = new Proxy(memory, { getPrototypeOf: () => DBProvider.prototype });
		remote.getQuerySequence = () => {
			throw new UnsupportedError("No subscriptions");
		};
		return remote;
	}
	test("is loading until it fetches", async () => {
		const store = new QueryStore(BASICS_COLLECTION, { num: 5, $order: "id" }, _getRemote());
		expect(store.age).toBe(Number.POSITIVE_INFINITY);
		await store.refresh();
		expect(_ids(store)).toEqual(["b", "c"]);
	});
	test("only fetches when the provider does not support subscriptions", async () => {
		const store = new QueryStore(BASICS_COLLECTION, { num: 5, $order: "id" }, _getRemote());
		const stop = runSequence(store);
		await store.refresh();
		await runMicrotasks();
		expect(_ids(store)).toEqual(["b", "c"]);
		expect(store.reason).toBe(undefined);
		stop();
	});
});
