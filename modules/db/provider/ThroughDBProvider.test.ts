import { describe, expect, test } from "bun:test";
import type { Collection } from "shelving/db";
import { ThroughDBProvider } from "shelving/db";
import type { Data } from "shelving/util/data";
import type { OptionalItem } from "shelving/util/item";
import { BASICS_COLLECTION, basic1, basic2, TransactionTestDBProvider } from "../../test/index.js";

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
