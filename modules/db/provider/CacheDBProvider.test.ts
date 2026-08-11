import { describe, expect, test } from "bun:test";
import { CacheDBProvider, MemoryDBProvider, RecordingDBProvider } from "shelving/db";
import { runMicrotasks } from "shelving/util/async";
import { runSequence } from "shelving/util/sequence";
import {
	BASICS_COLLECTION,
	basic1,
	basic2,
	basic4,
	basic999,
	expectOrderedItems,
	TransactionTestDBProvider,
	testDBProvider,
} from "../../test/index.js";

// Run the universal DBProvider contract suite against CacheDBProvider over a memory source.
// The transaction callback receives the cache over the source's transaction, so the source's sequence and nesting support passes through.
testDBProvider("CacheDBProvider", () => new CacheDBProvider(new MemoryDBProvider()), {
	transactions: true,
	nestedTransactions: true,
});

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

	test("query writes cache the matched items and write per item", async () => {
		const source = new MemoryDBProvider();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1); // Group "a".
		await source.setItem(BASICS_COLLECTION, "basic4", basic4); // Group "b".
		const provider = new CacheDBProvider(source);

		await provider.updateQuery(BASICS_COLLECTION, { group: "a" }, { str: "NEW" });
		expect(await source.getItem(BASICS_COLLECTION, "basic1")).toMatchObject({ ...basic1, str: "NEW" });
		expect(await provider.memory.getItem(BASICS_COLLECTION, "basic1")).toMatchObject({ ...basic1, str: "NEW" }); // Matched item now cached, with the update applied.
		expect(await provider.memory.getItem(BASICS_COLLECTION, "basic4")).toBe(undefined); // Unmatched item not cached.

		await provider.deleteQuery(BASICS_COLLECTION, { group: "a" });
		expect(await source.getItem(BASICS_COLLECTION, "basic1")).toBe(undefined);
		expect(await provider.memory.getItem(BASICS_COLLECTION, "basic1")).toBe(undefined);
	});

	test("updating an item fetches and caches it first", async () => {
		const source = new MemoryDBProvider();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1);
		const provider = new CacheDBProvider(source);

		await provider.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" });
		expect(await source.getItem(BASICS_COLLECTION, "basic1")).toMatchObject({ ...basic1, str: "NEW" });
		expect(await provider.memory.getItem(BASICS_COLLECTION, "basic1")).toMatchObject({ ...basic1, str: "NEW" });
	});

	test("updating or deleting a missing item skips the source write", async () => {
		const recording = new RecordingDBProvider(new MemoryDBProvider());
		const provider = new CacheDBProvider(recording);

		await provider.updateItem(BASICS_COLLECTION, "basicNone", { str: "NEW" });
		await provider.deleteItem(BASICS_COLLECTION, "basicNone");
		expect(recording.writes).toEqual([]); // The fetch found nothing, so no write reached the source.
	});

	test("mirrors a committed transaction's writes into the cache", async () => {
		const provider = new CacheDBProvider(new MemoryDBProvider());
		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		const id = await provider.transact(async tx => {
			await tx.updateItem(BASICS_COLLECTION, "basic1", { str: "TX" });
			return await tx.addItem(BASICS_COLLECTION, basic999);
		});
		expect(await provider.memory.getItem(BASICS_COLLECTION, "basic1")).toMatchObject({ ...basic1, str: "TX" });
		expect(await provider.memory.getItem(BASICS_COLLECTION, id)).toMatchObject(basic999);
	});

	test("does not mirror writes when the transaction throws", async () => {
		// `TransactionTestDBProvider` applies writes immediately with no rollback, proving the cache (not the source) withheld them.
		const source = new TransactionTestDBProvider();
		const provider = new CacheDBProvider(source);
		try {
			await provider.transact(async tx => {
				await tx.setItem(BASICS_COLLECTION, "basic1", basic1);
				throw new Error("nope");
			});
			expect.unreachable();
		} catch (thrown) {
			expect((thrown as Error).message).toBe("nope");
		}
		expect(await source.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1); // The test source applied the write…
		expect(await provider.memory.getItem(BASICS_COLLECTION, "basic1")).toBe(undefined); // …but the cache never mirrored it.
	});

	test("notifies cache subscribers after a transaction commits", async () => {
		const provider = new CacheDBProvider(new MemoryDBProvider());
		const calls: (typeof basic1)[][] = [];
		const stop = runSequence(
			provider.memory.getQuerySequence(BASICS_COLLECTION, { $order: "id" }),
			items => void calls.push(items as (typeof basic1)[]),
		);
		await runMicrotasks();
		await provider.transact(async tx => {
			await tx.setItem(BASICS_COLLECTION, "basic1", basic1);
		});
		await runMicrotasks();
		expectOrderedItems(calls.at(-1) ?? [], ["basic1"]);
		stop();
	});
});
