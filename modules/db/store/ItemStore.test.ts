import { describe, expect, test } from "bun:test";
import { ItemStore, MemoryDBProvider } from "shelving/db";
import { runMicrotasks } from "shelving/util/async";
import { BASICS_COLLECTION, basic1 } from "../../test/index.js";

describe("ItemStore with a MemoryDBProvider", () => {
	test("is loading while the memory has no item and no time for it", () => {
		const memory = new MemoryDBProvider<string>();
		const store = new ItemStore(BASICS_COLLECTION, "basic1", memory);
		expect(store.age).toBe(Number.POSITIVE_INFINITY);
	});
	test("seeds from the memory when it has the item", () => {
		const memory = new MemoryDBProvider<string>();
		memory.getTable(BASICS_COLLECTION).setItem("basic1", basic1);
		const store = new ItemStore(BASICS_COLLECTION, "basic1", memory);
		expect(store.value).toEqual(basic1);
	});
	test("seeds as missing when the memory knows the item is missing", () => {
		const memory = new MemoryDBProvider<string>();
		memory.getTable(BASICS_COLLECTION).deleteItem("basic1");
		const store = new ItemStore(BASICS_COLLECTION, "basic1", memory);
		expect(store.value).toBe(undefined);
	});
	test("a fetch waits until the memory loads the item", async () => {
		const memory = new MemoryDBProvider<string>();
		const store = new ItemStore(BASICS_COLLECTION, "basic1", memory);
		const refresh = store.refresh();
		await runMicrotasks();
		expect(store.age).toBe(Number.POSITIVE_INFINITY);
		memory.getTable(BASICS_COLLECTION).setItem("basic1", basic1);
		await refresh;
		expect(store.value).toEqual(basic1);
	});
	test("a fetch waits until the memory knows the item is missing", async () => {
		const memory = new MemoryDBProvider<string>();
		const store = new ItemStore(BASICS_COLLECTION, "basic1", memory);
		const refresh = store.refresh();
		memory.getTable(BASICS_COLLECTION).deleteItem("basic1");
		await refresh;
		expect(store.value).toBe(undefined);
	});
});
