import { describe, expect, test } from "bun:test";
import { MemoryDBProvider } from "shelving/db";
import { runMicrotasks } from "shelving/util/async";
import { runSequence } from "shelving/util/sequence";
import type { BasicItem } from "../../test/index.js";
import {
	BASICS_COLLECTION,
	basic1,
	basic2,
	basic3,
	expectOrderedItems,
	PEOPLE_COLLECTION,
	person1,
	testDBProvider,
} from "../../test/index.js";

// Run the universal DBProvider contract suite against MemoryDBProvider.
testDBProvider("MemoryDBProvider", () => new MemoryDBProvider<string>(), { transactions: true, nestedTransactions: true });

describe("MemoryDBProvider.transact()", () => {
	test("keeps writes made to the provider while the transaction is running", async () => {
		const db = new MemoryDBProvider<string>();
		await db.setItem(BASICS_COLLECTION, "basic1", basic1);
		await db.transact(async tx => {
			// Concurrent writes go directly to the provider while the transaction is open.
			await db.setItem(BASICS_COLLECTION, "basic2", basic2);
			await db.setItem(PEOPLE_COLLECTION, "person1", person1);
			await tx.setItem(BASICS_COLLECTION, "basic3", basic3);
		});
		expect(await db.getItem(BASICS_COLLECTION, "basic2")).toMatchObject(basic2); // Concurrent write kept.
		expect(await db.getItem(PEOPLE_COLLECTION, "person1")).toMatchObject(person1); // Concurrent write in an untouched collection kept.
		expect(await db.getItem(BASICS_COLLECTION, "basic3")).toMatchObject(basic3); // Transaction write committed.
	});

	test("keeps concurrent writes when the transaction throws", async () => {
		const db = new MemoryDBProvider<string>();
		try {
			await db.transact(async tx => {
				await db.setItem(BASICS_COLLECTION, "basic1", basic1);
				await tx.setItem(BASICS_COLLECTION, "basic2", basic2);
				throw new Error("nope");
			});
			expect.unreachable();
		} catch (thrown) {
			expect((thrown as Error).message).toBe("nope");
		}
		expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1); // Concurrent write kept.
		expect(await db.getItem(BASICS_COLLECTION, "basic2")).toBe(undefined); // Transaction write rolled back.
	});

	test("update changes replay as deltas on top of concurrent writes", async () => {
		const db = new MemoryDBProvider<string>();
		await db.setItem(BASICS_COLLECTION, "basic1", basic1);
		await db.transact(async tx => {
			await db.updateItem(BASICS_COLLECTION, "basic1", { "+=num": 10 }); // Concurrent write to the same item.
			await tx.updateItem(BASICS_COLLECTION, "basic1", { "+=num": 1 });
		});
		expect((await db.requireItem(BASICS_COLLECTION, "basic1")).num).toBe(basic1.num + 10 + 1); // The transaction's sum composed on top.
	});

	test("resolves query writes to the items matched inside the transaction", async () => {
		const db = new MemoryDBProvider<string>();
		await db.setItem(BASICS_COLLECTION, "basic1", basic1);
		await db.setItem(BASICS_COLLECTION, "basic2", basic2);
		await db.transact(async tx => {
			await db.setItem(BASICS_COLLECTION, "basic3", basic3); // Concurrent write that also matches the query.
			await tx.deleteQuery(BASICS_COLLECTION, { group: "a" });
		});
		// The delete resolved two-step against the transaction's snapshot, so the concurrently added item survives.
		expect(await db.getItem(BASICS_COLLECTION, "basic1")).toBe(undefined);
		expect(await db.getItem(BASICS_COLLECTION, "basic2")).toBe(undefined);
		expect(await db.getItem(BASICS_COLLECTION, "basic3")).toMatchObject(basic3);
	});

	test("reads inside the transaction see the transaction's own writes", async () => {
		const db = new MemoryDBProvider<string>();
		await db.setItem(BASICS_COLLECTION, "basic1", basic1);
		await db.transact(async tx => {
			await tx.setItem(BASICS_COLLECTION, "basic2", basic2);
			expect(await tx.getItem(BASICS_COLLECTION, "basic2")).toMatchObject(basic2);
			await tx.deleteItem(BASICS_COLLECTION, "basic1");
			expect(await tx.getItem(BASICS_COLLECTION, "basic1")).toBe(undefined);
			expect(await tx.countQuery(BASICS_COLLECTION, {})).toBe(1);
		});
	});

	test("preserves the identity of unchanged items across a commit", async () => {
		const db = new MemoryDBProvider<string>();
		await db.setItem(BASICS_COLLECTION, "basic1", basic1);
		const before = await db.getItem(BASICS_COLLECTION, "basic1");
		await db.transact(async tx => {
			await tx.setItem(BASICS_COLLECTION, "basic2", basic2);
		});
		expect(await db.getItem(BASICS_COLLECTION, "basic1")).toBe(before);
	});

	test("discards nested commits when the outer transaction throws", async () => {
		const db = new MemoryDBProvider<string>();
		try {
			await db.transact(async tx => {
				await tx.transact(async nested => {
					await nested.setItem(BASICS_COLLECTION, "basic1", basic1);
				});
				throw new Error("nope");
			});
			expect.unreachable();
		} catch (thrown) {
			expect((thrown as Error).message).toBe("nope");
		}
		expect(await db.getItem(BASICS_COLLECTION, "basic1")).toBe(undefined);
	});

	test("ends sequences opened inside a transaction that throws", async () => {
		const db = new MemoryDBProvider<string>();
		let sequence: Promise<number> | undefined;
		try {
			await db.transact(async tx => {
				sequence = (async () => {
					let count = 0;
					for await (const _item of tx.getItemSequence(BASICS_COLLECTION, "basic1")) count++;
					return count;
				})();
				await runMicrotasks();
				throw new Error("nope");
			});
			expect.unreachable();
		} catch (thrown) {
			expect((thrown as Error).message).toBe("nope");
		}
		expect(await sequence).toBe(1); // The sequence emitted its initial value, then ended with the transaction (this would hang otherwise).
	});

	test("notifies subscribers only after the transaction commits", async () => {
		const db = new MemoryDBProvider<string>();
		const calls: BasicItem[][] = [];
		const stop = runSequence(db.getQuerySequence(BASICS_COLLECTION, { $order: "id" }), items => void calls.push(items as BasicItem[]));
		await runMicrotasks();
		expect(calls.length).toBe(1);
		await db.transact(async tx => {
			await tx.setItem(BASICS_COLLECTION, "basic1", basic1);
			await tx.setItem(BASICS_COLLECTION, "basic2", basic2);
			await runMicrotasks();
			expect(calls.length).toBe(1); // Nothing emitted while the transaction is uncommitted.
		});
		await runMicrotasks();
		expectOrderedItems(calls.at(-1) ?? [], ["basic1", "basic2"]); // Both writes visible after the commit.
		stop();
	});
});

describe("MemoryDBProvider disposal", () => {
	test("disposing the provider ends open sequences", async () => {
		const db = new MemoryDBProvider<string>();
		await db.setItem(BASICS_COLLECTION, "basic1", basic1);
		const sequence = (async () => {
			let count = 0;
			for await (const _item of db.getItemSequence(BASICS_COLLECTION, "basic1")) count++;
			return count;
		})();
		await runMicrotasks();
		await db[Symbol.asyncDispose]();
		expect(await sequence).toBe(1); // The sequence emitted its initial value, then ended on disposal (this would hang otherwise).
	});
});

describe("MemoryTable times", () => {
	test("getItemTime() is undefined until the item is set or deleted", () => {
		const table = new MemoryDBProvider<string>().getTable(BASICS_COLLECTION);
		expect(table.getItemTime("basic1")).toBe(undefined);
		table.setItem("basic1", basic1);
		expect(table.getItemTime("basic1")).toBeNumber();
		expect(table.getItemTime("basic2")).toBe(undefined);
		table.deleteItem("basic2"); // The item does not exist, but the table now knows it is missing.
		expect(table.getItemTime("basic2")).toBeNumber();
		expect(table.getItem("basic2")).toBe(undefined);
	});
	test("getQueryTime() is undefined until setQueryTime() marks the query", () => {
		const table = new MemoryDBProvider<string>().getTable(BASICS_COLLECTION);
		expect(table.getQueryTime({ str: "aaa" })).toBe(undefined);
		table.setQueryTime({ str: "aaa" }, 123);
		expect(table.getQueryTime({ str: "aaa" })).toBe(123);
		expect(table.getQueryTime({ str: "aaa", $limit: 1 })).toBe(undefined); // Queries match exactly.
		table.setQueryTime(undefined, 456);
		expect(table.getQueryTime()).toBe(456);
		expect(table.getQueryTime({})).toBe(456);
	});
	test("getItemSequence() yields again when a missing item is marked as missing", async () => {
		const table = new MemoryDBProvider<string>().getTable(BASICS_COLLECTION);
		const values: unknown[] = [];
		const stop = runSequence(table.getItemSequence("basic1"), value => void values.push(value));
		await runMicrotasks();
		table.deleteItem("basic1");
		await runMicrotasks();
		table.deleteItem("basic1"); // Already marked, so no change.
		await runMicrotasks();
		stop();
		expect(values).toEqual([undefined, undefined]);
	});
	test("getQuerySequence() yields again when an empty query is marked as loaded", async () => {
		const table = new MemoryDBProvider<string>().getTable(BASICS_COLLECTION);
		const values: unknown[] = [];
		const stop = runSequence(table.getQuerySequence({ str: "aaa" }), value => void values.push(value));
		await runMicrotasks();
		table.setQueryTime({ str: "aaa" });
		await runMicrotasks();
		table.setQueryTime({ str: "aaa" }); // Already marked, so no change.
		await runMicrotasks();
		stop();
		expect(values).toEqual([[], []]);
	});
});
