import { describe, expect, test } from "bun:test";
import { ChangesDBProvider, MockDBProvider } from "shelving/db";
import { BASICS_COLLECTION, basic1, basic999 } from "../../test/index.js";

describe("ChangesDBProvider", () => {
	test("records addItem() with an add action", async () => {
		const provider = new ChangesDBProvider(new MockDBProvider());
		const id = await provider.addItem(BASICS_COLLECTION, basic999);

		expect(provider.changes).toEqual([{ action: "add", collection: "basics", id, data: basic999 }]);
	});

	test("records subsequent write operations in order", async () => {
		const provider = new ChangesDBProvider(new MockDBProvider());

		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		await provider.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" });
		await provider.deleteQuery(BASICS_COLLECTION, { id: ["basic1"] });

		expect(provider.changes.slice(-3)).toEqual([
			{ action: "set", collection: "basics", id: "basic1", data: basic1 },
			{ action: "update", collection: "basics", id: "basic1", updates: { str: "NEW" } },
			{ action: "delete", collection: "basics", query: { id: ["basic1"] } },
		]);
	});

	test("records transact() writes after the transaction commits", async () => {
		const provider = new ChangesDBProvider(new MockDBProvider());

		await provider.transact(async tx => {
			await tx.setItem(BASICS_COLLECTION, "basic1", basic1);
			await tx.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" });
		});

		expect(provider.changes).toEqual([
			{ action: "set", collection: "basics", id: "basic1", data: basic1 },
			{ action: "update", collection: "basics", id: "basic1", updates: { str: "NEW" } },
		]);
	});

	test("records nothing when a transact() callback throws", async () => {
		const provider = new ChangesDBProvider(new MockDBProvider());

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
});
