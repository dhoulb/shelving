import { describe, expect, test } from "bun:test";
import type { Collection } from "shelving/db";
import { MockDBProvider, ThroughDBProvider } from "shelving/db";
import type { Data } from "shelving/util/data";
import type { OptionalItem } from "shelving/util/item";
import { BASICS_COLLECTION, basic1, basic2, basic4, TransactionTestDBProvider } from "../../test/index.js";

/** Wrapping provider that records the ids of reads and writes passing through it. */
class _TestDBProvider extends ThroughDBProvider<string, Data> {
	readonly reads: string[] = [];
	readonly writes: string[] = [];

	override getItem<II extends string, TT extends Data>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		this.reads.push(id);
		return super.getItem(collection, id);
	}

	override setItem<II extends string, TT extends Data>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		this.writes.push(id);
		return super.setItem(collection, id, data);
	}
}

describe("ThroughDBProvider", () => {
	test("transact() routes reads and writes through the wrapping provider", async () => {
		const source = new TransactionTestDBProvider<string>();
		const provider = new _TestDBProvider(source);
		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);

		await provider.transact(async tx => {
			expect(await tx.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
			await tx.setItem(BASICS_COLLECTION, "basic2", basic2);
		});

		// The wrapper's overrides ran for the operations inside the transaction.
		expect(provider.reads).toEqual(["basic1"]);
		expect(provider.writes).toEqual(["basic1", "basic2"]);
		// The transaction wrote through to the source.
		expect(await source.getItem(BASICS_COLLECTION, "basic2")).toMatchObject(basic2);
	});

	test("query writes are two-step: resolved with getQuery() then written per item", async () => {
		const source = new MockDBProvider<string>();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1); // Group "a".
		await source.setItem(BASICS_COLLECTION, "basic2", basic2); // Group "a".
		await source.setItem(BASICS_COLLECTION, "basic4", basic4); // Group "b".
		source.calls.length = 0;
		const provider = new ThroughDBProvider<string, Data>(source);

		await provider.updateQuery(BASICS_COLLECTION, { group: "a" }, { str: "NEW" });
		await provider.deleteQuery(BASICS_COLLECTION, { group: "b" });

		// The source received a resolve read plus per-item writes — never a query write.
		expect(source.calls.map(({ type, id }) => ({ type, id }))).toEqual([
			{ type: "getQuery", id: undefined },
			{ type: "updateItem", id: "basic1" },
			{ type: "updateItem", id: "basic2" },
			{ type: "getQuery", id: undefined },
			{ type: "deleteItem", id: "basic4" },
		]);
		expect(await source.getItem(BASICS_COLLECTION, "basic1")).toMatchObject({ ...basic1, str: "NEW" });
		expect(await source.getItem(BASICS_COLLECTION, "basic4")).toBe(undefined);
	});

	test("transact() propagates callback errors", async () => {
		const provider = new _TestDBProvider(new TransactionTestDBProvider<string>());

		try {
			await provider.transact(async () => {
				throw new Error("nope");
			});
			expect.unreachable();
		} catch (thrown) {
			expect((thrown as Error).message).toBe("nope");
		}
	});
});
