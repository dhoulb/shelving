import { describe, expect, test } from "bun:test";
import { CacheDBProvider, MemoryDBProvider, QueryStore } from "shelving/db";
import { runMicrotasks } from "shelving/util/async";
import type { Query } from "shelving/util/query";
import { runSequence } from "shelving/util/sequence";
import { BASICS_COLLECTION, type BasicData, type BasicItem, basic1 } from "../../test/index.js";

const _basic = (id: string, num: number): BasicItem => ({ ...basic1, id, num });

// Newest first, with three items that share `num: 5`.
const ITEMS = [
	_basic("g", 7),
	_basic("f", 6),
	_basic("e3", 5),
	_basic("e2", 5),
	_basic("e1", 5),
	_basic("d", 4),
	_basic("c", 3),
	_basic("b", 2),
	_basic("a", 1),
];
const QUERY: Query<BasicItem> = { $order: "!num", $limit: 2 };

function _setup(query: Query<BasicItem> = QUERY) {
	const server = new MemoryDBProvider<string>();
	server.setItems(BASICS_COLLECTION, ITEMS);
	const provider = new CacheDBProvider(server);
	const store = new QueryStore(BASICS_COLLECTION, query, provider, provider.memory);
	return { server, provider, store };
}

const _ids = (store: QueryStore<string, BasicData>) => store.value.map(({ id }) => id);

describe("fetchAfter()", () => {
	test("loads every page in order without skipping or repeating items with the same sort value", async () => {
		const { store } = _setup();
		await store.refresh();
		expect(_ids(store)).toEqual(["g", "f"]);
		expect(store.hasAfter).toBe(true);
		while (store.hasAfter) await store.fetchAfter();
		expect(new Set(_ids(store)).size).toBe(ITEMS.length);
		expect(_ids(store).slice(2, 5).sort()).toEqual(["e1", "e2", "e3"]);
		expect(_ids(store).slice(5)).toEqual(["d", "c", "b", "a"]);
		expect(store.hasMore).toBe(false);
	});
	test("loads every item when the cursor is inside a group of items with the same sort value", async () => {
		const { store } = _setup({ $order: "!num", $limit: 3 });
		await store.refresh();
		expect(_ids(store)).toEqual(["g", "f", expect.any(String)]);
		await store.fetchAfter();
		await store.fetchAfter();
		await store.fetchAfter();
		expect(new Set(_ids(store)).size).toBe(ITEMS.length);
		expect(store.hasAfter).toBe(false);
	});
	test("sets busy while a page loads", async () => {
		const { store } = _setup();
		await store.refresh();
		const promise = store.fetchAfter();
		expect(store.busy.value).toBe(true);
		await promise;
		expect(store.busy.value).toBe(false);
	});
	test("throws for a query without $order", () => {
		const { store } = _setup({ $limit: 2 });
		expect(() => store.fetchAfter()).toThrow();
	});
});

describe("fetchBefore()", () => {
	test("loads new items at the start and keeps the loaded items", async () => {
		const { server, store } = _setup();
		await store.refresh();
		await store.fetchAfter();
		server.setItems(BASICS_COLLECTION, [_basic("h", 8), _basic("i", 9), _basic("j", 10)]);
		await store.fetchBefore();
		expect(store.hasBefore).toBe(true);
		// Pins one page ("h", "i"). The extra "j" is in the memory too, so it shows at the start.
		expect(_ids(store).slice(0, 5)).toEqual(["j", "i", "h", "g", "f"]);
		await store.fetchBefore();
		expect(store.hasBefore).toBe(false);
		expect(_ids(store).slice(0, 5)).toEqual(["j", "i", "h", "g", "f"]);
	});
});

describe("refresh()", () => {
	test("reloads every loaded page", async () => {
		const { store } = _setup();
		await store.refresh();
		await store.fetchAfter();
		await store.fetchAfter();
		const loaded = _ids(store);
		await store.refresh();
		expect(_ids(store)).toEqual(loaded);
		expect(store.hasAfter).toBe(true);
	});
});

describe("pinned items", () => {
	test("an edited item keeps its position", async () => {
		const { provider, store } = _setup();
		const stop = runSequence(store);
		await store.refresh();
		await provider.updateItem(BASICS_COLLECTION, "f", { num: 100 });
		await runMicrotasks();
		expect(_ids(store)).toEqual(["g", "f"]);
		expect(store.value[1]?.num).toBe(100);
		stop();
	});
	test("a deleted item is hidden, and comes back in its position when it is restored", async () => {
		const { provider, store } = _setup();
		const stop = runSequence(store);
		await store.refresh();
		const table = provider.memory.getTable(BASICS_COLLECTION);
		const g = table.getItem("g");
		table.deleteItem("g");
		await runMicrotasks();
		expect(_ids(store)).toEqual(["f"]);
		if (g) table.setItem("g", g);
		await runMicrotasks();
		expect(_ids(store)).toEqual(["g", "f"]);
		stop();
	});
	test("a new item in the memory that sorts before the first item shows at the start", async () => {
		const { provider, store } = _setup();
		const stop = runSequence(store);
		await store.refresh();
		const table = provider.memory.getTable(BASICS_COLLECTION);
		table.setItem("preview", _basic("preview", 99));
		table.setItem("old", _basic("old", 0));
		await runMicrotasks();
		expect(_ids(store)).toEqual(["preview", "g", "f"]);
		table.deleteItem("preview");
		await runMicrotasks();
		expect(_ids(store)).toEqual(["g", "f"]);
		stop();
	});
	test("loaded items are put in the memory", async () => {
		const { provider, store } = _setup();
		await store.refresh();
		await store.fetchAfter();
		expect(provider.memory.getTable(BASICS_COLLECTION).getItem("e3")).toBeDefined();
	});
});
