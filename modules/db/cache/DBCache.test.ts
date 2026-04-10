import { describe, expect, test } from "bun:test";
import { CacheDBProvider, CollectionCache, DBCache, MockDBProvider, runMicrotasks } from "../../index.js";
import { BASICS_COLLECTION, basic1, basic2, PEOPLE_COLLECTION, person1 } from "../../test/index.js";

describe("DBCache", () => {
	test("get() returns a `CollectionCache` and reuses it for the same collection", () => {
		const provider = new MockDBProvider();
		const cache = new DBCache(provider);

		const first = cache.get(BASICS_COLLECTION);
		const second = cache.get(BASICS_COLLECTION);

		expect(first).toBeInstanceOf(CollectionCache);
		expect(first).toBe(second);
	});

	test("different collections get different `CollectionCache` instances", () => {
		const provider = new MockDBProvider();
		const cache = new DBCache(provider);

		const basics = cache.get(BASICS_COLLECTION);
		const people = cache.get(PEOPLE_COLLECTION);

		expect(basics).not.toBe(people);
	});

	test("getItem() shortcut returns the same store as get(collection).getItem(id)", () => {
		const provider = new MockDBProvider();
		const cache = new DBCache(provider);

		const viaShortcut = cache.getItem(BASICS_COLLECTION, "basic1");
		const viaTwoHop = cache.get(BASICS_COLLECTION).getItem("basic1");

		expect(viaShortcut).toBe(viaTwoHop);
	});

	test("getQuery() shortcut returns the same store as get(collection).getQuery(query)", () => {
		const provider = new MockDBProvider();
		const cache = new DBCache(provider);

		const viaShortcut = cache.getQuery(BASICS_COLLECTION, { $order: "id" });
		const viaTwoHop = cache.get(BASICS_COLLECTION).getQuery({ $order: "id" });

		expect(viaShortcut).toBe(viaTwoHop);
	});

	test("refreshItem() refreshes only the targeted store", async () => {
		const provider = new MockDBProvider();
		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		await provider.setItem(BASICS_COLLECTION, "basic2", basic2);
		const cache = new DBCache(provider);

		cache.getItem(BASICS_COLLECTION, "basic1");
		cache.getItem(BASICS_COLLECTION, "basic2");
		await runMicrotasks();

		const before = provider.calls.filter(c => c.type === "getItem").length;
		cache.refreshItem(BASICS_COLLECTION, "basic1");
		await runMicrotasks();
		const after = provider.calls.filter(c => c.type === "getItem").length;

		expect(after - before).toBe(1);
		expect(provider.calls.at(-1)?.id).toBe("basic1");
	});

	test("refreshAll(collection) refreshes items and queries for that collection only", async () => {
		const provider = new MockDBProvider();
		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		await provider.setItem(PEOPLE_COLLECTION, "person1", person1);
		const cache = new DBCache(provider);

		cache.getItem(BASICS_COLLECTION, "basic1");
		cache.getQuery(BASICS_COLLECTION, { $order: "id" });
		cache.getItem(PEOPLE_COLLECTION, "person1");
		await runMicrotasks();

		const basicsItemsBefore = provider.calls.filter(c => c.type === "getItem" && c.collection === "basics").length;
		const basicsQueriesBefore = provider.calls.filter(c => c.type === "getQuery" && c.collection === "basics").length;
		const peopleItemsBefore = provider.calls.filter(c => c.type === "getItem" && c.collection === "people").length;

		cache.refreshAll(BASICS_COLLECTION);
		await runMicrotasks();

		const basicsItemsAfter = provider.calls.filter(c => c.type === "getItem" && c.collection === "basics").length;
		const basicsQueriesAfter = provider.calls.filter(c => c.type === "getQuery" && c.collection === "basics").length;
		const peopleItemsAfter = provider.calls.filter(c => c.type === "getItem" && c.collection === "people").length;

		expect(basicsItemsAfter - basicsItemsBefore).toBe(1);
		expect(basicsQueriesAfter - basicsQueriesBefore).toBe(1);
		expect(peopleItemsAfter - peopleItemsBefore).toBe(0);
	});

	test("[Symbol.dispose]() clears the inner caches and disposes each one", () => {
		const provider = new MockDBProvider();
		const cache = new DBCache(provider);

		const firstCollection = cache.get(BASICS_COLLECTION);
		const firstItem = firstCollection.getItem("basic1");

		cache[Symbol.dispose]();

		const secondCollection = cache.get(BASICS_COLLECTION);
		const secondItem = secondCollection.getItem("basic1");

		expect(secondCollection).not.toBe(firstCollection);
		expect(secondItem).not.toBe(firstItem);
	});

	test("memory is extracted from a CacheDBProvider in the provider chain", async () => {
		const source = new MockDBProvider();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1);
		const cached = new CacheDBProvider(source);
		// Warm the memory cache by fetching once through the CacheDBProvider.
		await cached.getItem(BASICS_COLLECTION, "basic1");

		const cache = new DBCache(cached);
		expect(cache.memory).toBe(cached.memory);

		// A store built via the cache should be synchronously seeded from the memory snapshot.
		const store = cache.getItem(BASICS_COLLECTION, "basic1");
		expect(store.value).toMatchObject(basic1);
	});

	test("memory is undefined when no CacheDBProvider is present", () => {
		const provider = new MockDBProvider();
		const cache = new DBCache(provider);
		expect(cache.memory).toBeUndefined();
	});
});
