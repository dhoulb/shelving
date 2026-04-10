import { describe, expect, test } from "bun:test";
import { CacheDBProvider, MemoryDBProvider, runMicrotasks, runSequence } from "../../index.js";
import { BASICS_COLLECTION, basic1, basic2, expectOrderedItems } from "../../test/index.js";

describe("CacheDBProvider", () => {
	test("copies fetched items and queries into the memory cache", async () => {
		const source = new MemoryDBProvider();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1);
		await source.setItem(BASICS_COLLECTION, "basic2", basic2);
		const provider = new CacheDBProvider(source);

		expect(await provider.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
		expect(await provider.memory.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);

		expectOrderedItems(await provider.getQuery(BASICS_COLLECTION, { $order: "id" }), ["basic1", "basic2"]);
		expectOrderedItems(await provider.memory.getQuery(BASICS_COLLECTION, { $order: "id" }), ["basic1", "basic2"]);
	});

	test("writes sequence results into the memory cache", async () => {
		const source = new MemoryDBProvider();
		const provider = new CacheDBProvider(source);
		const calls: (typeof basic1)[][] = [];
		const stop = runSequence(
			provider.getQuerySequence(BASICS_COLLECTION, { $order: "id" }),
			items => void calls.push(items as (typeof basic1)[]),
		);

		await runMicrotasks();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1);
		await runMicrotasks();

		expectOrderedItems(calls[0] ?? [], []);
		expectOrderedItems(calls[1] ?? [], ["basic1"]);
		expect(await provider.memory.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
		stop();
	});

	test("updates query subscribers after item writes", async () => {
		const source = new MemoryDBProvider();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1);
		const provider = new CacheDBProvider(source);
		const calls: (typeof basic1)[][] = [];

		await provider.getQuery(BASICS_COLLECTION, { $order: "id" });
		const stop = runSequence(
			provider.memory.getQuerySequence(BASICS_COLLECTION, { $order: "id" }),
			items => void calls.push(items as (typeof basic1)[]),
		);
		await runMicrotasks();
		await provider.setItem(BASICS_COLLECTION, "basic2", basic2);
		await runMicrotasks();

		expectOrderedItems(calls[0] ?? [], ["basic1"]);
		expectOrderedItems(calls[1] ?? [], ["basic1", "basic2"]);
		stop();
	});
});
