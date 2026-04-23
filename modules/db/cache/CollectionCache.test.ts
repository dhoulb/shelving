import { describe, expect, test } from "bun:test";
import { CollectionCache, ItemStore, MockDBProvider, QueryStore, runMicrotasks } from "../../index.js";
import { BASICS_COLLECTION, basic1, basic2 } from "../../test/index.js";

describe("CollectionCache", () => {
	test("getItem() reuses the same store for the same id", () => {
		const provider = new MockDBProvider<string>();
		const cache = new CollectionCache(BASICS_COLLECTION, provider);

		const first = cache.getItem("basic1");
		const second = cache.getItem("basic1");

		expect(first).toBe(second);
		expect(first).toBeInstanceOf(ItemStore);
	});

	test("getQuery() reuses the same store for deeply equal queries", () => {
		const provider = new MockDBProvider<string>();
		const cache = new CollectionCache(BASICS_COLLECTION, provider);

		const first = cache.getQuery({ $order: "id" });
		const second = cache.getQuery({ $order: "id" });

		expect(first).toBe(second);
		expect(first).toBeInstanceOf(QueryStore);
	});

	test("getItem and getQuery maps are independent", () => {
		const provider = new MockDBProvider<string>();
		const cache = new CollectionCache(BASICS_COLLECTION, provider);

		const item = cache.getItem("basic1");
		const query = cache.getQuery({ $order: "id" });

		expect(item).toBeInstanceOf(ItemStore);
		expect(query).toBeInstanceOf(QueryStore);
		expect(item).not.toBe(query);
	});

	test("refreshItem() triggers a re-fetch only on the targeted item store", async () => {
		const provider = new MockDBProvider<string>();
		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		await provider.setItem(BASICS_COLLECTION, "basic2", basic2);
		const cache = new CollectionCache(BASICS_COLLECTION, provider);

		cache.getItem("basic1");
		cache.getItem("basic2");
		await runMicrotasks();

		const before = provider.calls.filter(c => c.type === "getItem").length;
		await cache.refreshItem("basic1");
		const after = provider.calls.filter(c => c.type === "getItem").length;

		expect(after - before).toBe(1);
		expect(provider.calls.at(-1)?.id).toBe("basic1");
	});

	test("refreshItems() refreshes every item store but not query stores", async () => {
		const provider = new MockDBProvider<string>();
		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		await provider.setItem(BASICS_COLLECTION, "basic2", basic2);
		const cache = new CollectionCache(BASICS_COLLECTION, provider);

		cache.getItem("basic1");
		cache.getItem("basic2");
		cache.getQuery({ $order: "id" });
		await runMicrotasks();

		const getItemBefore = provider.calls.filter(c => c.type === "getItem").length;
		const getQueryBefore = provider.calls.filter(c => c.type === "getQuery").length;
		await cache.refreshItems();
		const getItemAfter = provider.calls.filter(c => c.type === "getItem").length;
		const getQueryAfter = provider.calls.filter(c => c.type === "getQuery").length;

		expect(getItemAfter - getItemBefore).toBe(2);
		expect(getQueryAfter - getQueryBefore).toBe(0);
	});

	test("refreshQueries() refreshes every query store but not item stores", async () => {
		const provider = new MockDBProvider<string>();
		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		const cache = new CollectionCache(BASICS_COLLECTION, provider);

		cache.getItem("basic1");
		cache.getQuery({ $order: "id" });
		cache.getQuery({ $order: "num" });
		await runMicrotasks();

		const getItemBefore = provider.calls.filter(c => c.type === "getItem").length;
		const getQueryBefore = provider.calls.filter(c => c.type === "getQuery").length;
		await cache.refreshQueries();
		const getItemAfter = provider.calls.filter(c => c.type === "getItem").length;
		const getQueryAfter = provider.calls.filter(c => c.type === "getQuery").length;

		expect(getItemAfter - getItemBefore).toBe(0);
		expect(getQueryAfter - getQueryBefore).toBe(2);
	});

	test("refreshAll() refreshes both items and queries", async () => {
		const provider = new MockDBProvider<string>();
		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		const cache = new CollectionCache(BASICS_COLLECTION, provider);

		cache.getItem("basic1");
		cache.getQuery({ $order: "id" });
		await runMicrotasks();

		const getItemBefore = provider.calls.filter(c => c.type === "getItem").length;
		const getQueryBefore = provider.calls.filter(c => c.type === "getQuery").length;
		await cache.refreshAll();
		const getItemAfter = provider.calls.filter(c => c.type === "getItem").length;
		const getQueryAfter = provider.calls.filter(c => c.type === "getQuery").length;

		expect(getItemAfter - getItemBefore).toBe(1);
		expect(getQueryAfter - getQueryBefore).toBe(1);
	});

	test("[Symbol.asyncDispose]() clears both internal maps", async () => {
		const provider = new MockDBProvider<string>();
		const cache = new CollectionCache(BASICS_COLLECTION, provider);

		const firstItem = cache.getItem("basic1");
		const firstQuery = cache.getQuery({ $order: "id" });

		await cache[Symbol.asyncDispose]();

		const secondItem = cache.getItem("basic1");
		const secondQuery = cache.getQuery({ $order: "id" });

		expect(secondItem).not.toBe(firstItem);
		expect(secondQuery).not.toBe(firstQuery);
	});
});
