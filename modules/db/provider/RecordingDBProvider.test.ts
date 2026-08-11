import { describe, expect, test } from "bun:test";
import { MemoryDBProvider, MockDBProvider, RecordingDBProvider } from "shelving/db";
import { BASICS_COLLECTION, basic1, basic2, basic4, basic999, TransactionTestDBProvider } from "../../test/index.js";

describe("RecordingDBProvider", () => {
	test("records addItem() with an add operation", async () => {
		const provider = new RecordingDBProvider(new MockDBProvider());
		const id = await provider.addItem(BASICS_COLLECTION, basic999);

		expect(provider.operations).toEqual([{ action: "add", collection: BASICS_COLLECTION, id, data: basic999 }]);
	});

	test("records write operations in order", async () => {
		const provider = new RecordingDBProvider(new MockDBProvider());

		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		await provider.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" });
		await provider.deleteItem(BASICS_COLLECTION, "basic1");

		expect(provider.operations).toEqual([
			{ action: "set", collection: BASICS_COLLECTION, id: "basic1", data: basic1 },
			{ action: "update", collection: BASICS_COLLECTION, id: "basic1", updates: { str: "NEW" } },
			{ action: "delete", collection: BASICS_COLLECTION, id: "basic1" },
		]);
	});

	test("records reads with the item they observed, including confirmed absence", async () => {
		const source = new MemoryDBProvider();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1);
		const provider = new RecordingDBProvider(source);

		await provider.getItem(BASICS_COLLECTION, "basic1");
		await provider.getItem(BASICS_COLLECTION, "basicNone");
		await provider.getQuery(BASICS_COLLECTION, { group: "a" });

		expect(provider.operations).toEqual([
			{ action: "get", collection: BASICS_COLLECTION, id: "basic1", data: basic1 },
			{ action: "get", collection: BASICS_COLLECTION, id: "basicNone", data: undefined },
			{ action: "get", collection: BASICS_COLLECTION, id: "basic1", data: basic1 }, // getQuery() logs a get per returned item.
		]);
		expect(provider.reads).toHaveLength(3);
		expect(provider.writes).toHaveLength(0);
	});

	test("records query writes as their resolve reads plus the per-item writes", async () => {
		const provider = new RecordingDBProvider(new MemoryDBProvider());
		await provider.setItem(BASICS_COLLECTION, "basic1", basic1); // Group "a".
		await provider.setItem(BASICS_COLLECTION, "basic2", basic2); // Group "a".
		await provider.setItem(BASICS_COLLECTION, "basic4", basic4); // Group "b".

		await provider.updateQuery(BASICS_COLLECTION, { group: "a" }, { str: "NEW" });

		expect(provider.operations.slice(-4)).toEqual([
			{ action: "get", collection: BASICS_COLLECTION, id: "basic1", data: basic1 }, // The two-step resolve is recorded…
			{ action: "get", collection: BASICS_COLLECTION, id: "basic2", data: basic2 },
			{ action: "update", collection: BASICS_COLLECTION, id: "basic1", updates: { str: "NEW" } }, // …then the per-item writes.
			{ action: "update", collection: BASICS_COLLECTION, id: "basic2", updates: { str: "NEW" } },
		]);
		expect(provider.writes.slice(-2).every(({ action }) => action === "update")).toBe(true);
	});

	test("records transact() operations after the transaction commits", async () => {
		const provider = new RecordingDBProvider(new TransactionTestDBProvider());

		await provider.transact(async tx => {
			await tx.setItem(BASICS_COLLECTION, "basic1", basic1);
			await tx.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" });
		});

		expect(provider.operations).toEqual([
			{ action: "set", collection: BASICS_COLLECTION, id: "basic1", data: basic1 },
			{ action: "update", collection: BASICS_COLLECTION, id: "basic1", updates: { str: "NEW" } },
		]);
	});

	test("records nothing when a transact() callback throws", async () => {
		const provider = new RecordingDBProvider(new TransactionTestDBProvider());

		try {
			await provider.transact(async tx => {
				await tx.setItem(BASICS_COLLECTION, "basic1", basic1);
				throw new Error("nope");
			});
			expect.unreachable();
		} catch (thrown) {
			expect((thrown as Error).message).toBe("nope");
		}
		expect(provider.operations).toEqual([]);
	});

	test("replayWrites() re-issues the recorded writes onto another provider", async () => {
		const provider = new RecordingDBProvider(new MemoryDBProvider());
		const id = await provider.addItem(BASICS_COLLECTION, basic999);
		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		await provider.setItem(BASICS_COLLECTION, "basic2", basic2);
		await provider.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" });
		await provider.deleteItem(BASICS_COLLECTION, "basic2");
		await provider.setItem(BASICS_COLLECTION, "basic4", basic4);
		await provider.deleteQuery(BASICS_COLLECTION, { group: "b" }); // Two-step, so this records a resolve read plus a per-item delete.

		const target = new MemoryDBProvider();
		await provider.replayWrites(target);

		expect(await target.getItem(BASICS_COLLECTION, id)).toMatchObject(basic999); // Adds replay with the same generated id.
		// Replaying the writes reproduces the source provider's state exactly.
		expect(await target.getQuery(BASICS_COLLECTION, { $order: "id" })).toEqual(
			await provider.getQuery(BASICS_COLLECTION, { $order: "id" }),
		);
	});

	test("replay() refreshes a mirror with observed reads and gives update deltas their base", async () => {
		const source = new MemoryDBProvider();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1);
		const provider = new RecordingDBProvider(source);

		await provider.getItem(BASICS_COLLECTION, "basic1"); // Observed fresh…
		await provider.updateItem(BASICS_COLLECTION, "basic1", { "+=num": 1 }); // …then updated.
		await provider.getItem(BASICS_COLLECTION, "basicNone"); // Confirmed absent.

		// A mirror holding a stale copy of basic1 and a ghost copy of basicNone.
		const mirror = new MemoryDBProvider();
		await mirror.setItem(BASICS_COLLECTION, "basic1", { ...basic1, num: 1 });
		await mirror.setItem(BASICS_COLLECTION, "basicNone", basic999);

		await provider.replay(mirror);
		expect((await mirror.requireItem(BASICS_COLLECTION, "basic1")).num).toBe(basic1.num + 1); // Read refreshed the stale base, then the delta applied.
		expect(await mirror.getItem(BASICS_COLLECTION, "basicNone")).toBe(undefined); // Confirmed absence deleted the ghost.
	});

	test("replayReads() applies only the observed reads", async () => {
		const source = new MemoryDBProvider();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1);
		const provider = new RecordingDBProvider(source);
		await provider.getItem(BASICS_COLLECTION, "basic1");
		await provider.setItem(BASICS_COLLECTION, "basic2", basic2);

		const mirror = new MemoryDBProvider();
		await provider.replayReads(mirror);
		expect(await mirror.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
		expect(await mirror.getItem(BASICS_COLLECTION, "basic2")).toBe(undefined); // Writes are not applied.
	});
});
