import { describe, expect, test } from "bun:test";
import { ChangesDBProvider, MemoryDBProvider, MockDBProvider } from "shelving/db";
import { BASICS_COLLECTION, basic1, basic2, basic4, basic999, TransactionTestDBProvider } from "../../test/index.js";

describe("ChangesDBProvider", () => {
	test("records addItem() with an add action", async () => {
		const provider = new ChangesDBProvider(new MockDBProvider());
		const id = await provider.addItem(BASICS_COLLECTION, basic999);

		expect(provider.changes).toEqual([{ action: "add", collection: BASICS_COLLECTION, id, data: basic999 }]);
	});

	test("records subsequent write operations in order", async () => {
		const provider = new ChangesDBProvider(new MockDBProvider());

		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		await provider.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" });
		await provider.deleteItem(BASICS_COLLECTION, "basic1");

		expect(provider.changes.slice(-3)).toEqual([
			{ action: "set", collection: BASICS_COLLECTION, id: "basic1", data: basic1 },
			{ action: "update", collection: BASICS_COLLECTION, id: "basic1", updates: { str: "NEW" } },
			{ action: "delete", collection: BASICS_COLLECTION, id: "basic1" },
		]);
	});

	test("records query writes as the per-item changes they resolve to", async () => {
		const provider = new ChangesDBProvider(new MemoryDBProvider());
		await provider.setItem(BASICS_COLLECTION, "basic1", basic1); // Group "a".
		await provider.setItem(BASICS_COLLECTION, "basic2", basic2); // Group "a".
		await provider.setItem(BASICS_COLLECTION, "basic4", basic4); // Group "b".

		await provider.updateQuery(BASICS_COLLECTION, { group: "a" }, { str: "NEW" });
		await provider.deleteQuery(BASICS_COLLECTION, { group: "b" });

		expect(provider.changes.slice(-3)).toEqual([
			{ action: "update", collection: BASICS_COLLECTION, id: "basic1", updates: { str: "NEW" } },
			{ action: "update", collection: BASICS_COLLECTION, id: "basic2", updates: { str: "NEW" } },
			{ action: "delete", collection: BASICS_COLLECTION, id: "basic4" },
		]);
	});

	test("records transact() writes after the transaction commits", async () => {
		const provider = new ChangesDBProvider(new TransactionTestDBProvider());

		await provider.transact(async tx => {
			await tx.setItem(BASICS_COLLECTION, "basic1", basic1);
			await tx.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" });
		});

		expect(provider.changes).toEqual([
			{ action: "set", collection: BASICS_COLLECTION, id: "basic1", data: basic1 },
			{ action: "update", collection: BASICS_COLLECTION, id: "basic1", updates: { str: "NEW" } },
		]);
	});

	test("records nothing when a transact() callback throws", async () => {
		const provider = new ChangesDBProvider(new TransactionTestDBProvider());

		try {
			await provider.transact(async tx => {
				await tx.setItem(BASICS_COLLECTION, "basic1", basic1);
				throw new Error("nope");
			});
			expect.unreachable();
		} catch (thrown) {
			expect((thrown as Error).message).toBe("nope");
		}
		expect(provider.changes).toEqual([]);
	});

	test("replay() re-issues logged changes onto another provider", async () => {
		const provider = new ChangesDBProvider(new MemoryDBProvider());
		const id = await provider.addItem(BASICS_COLLECTION, basic999);
		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		await provider.setItem(BASICS_COLLECTION, "basic2", basic2);
		await provider.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" });
		await provider.deleteItem(BASICS_COLLECTION, "basic2");
		await provider.setItem(BASICS_COLLECTION, "basic4", basic4);
		await provider.deleteQuery(BASICS_COLLECTION, { group: "b" }); // Two-step, so this logs a per-item delete.

		const target = new MemoryDBProvider();
		await provider.replay(target);

		expect(await target.getItem(BASICS_COLLECTION, id)).toMatchObject(basic999); // Adds replay with the same generated id.
		// Replaying the full log reproduces the source provider's state exactly.
		expect(await target.getQuery(BASICS_COLLECTION, { $order: "id" })).toEqual(
			await provider.getQuery(BASICS_COLLECTION, { $order: "id" }),
		);
	});
});
