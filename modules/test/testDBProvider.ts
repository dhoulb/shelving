import { describe, expect, test } from "bun:test";
import type { DBProvider } from "../db/provider/DBProvider.js";
import { RequiredError } from "../error/RequiredError.js";
import { UnsupportedError } from "../error/UnsupportedError.js";
import { runMicrotasks } from "../util/async.js";
import type { Data } from "../util/data.js";
import type { Items, OptionalItem } from "../util/item.js";
import { runSequence } from "../util/sequence.js";
import { BASICS_COLLECTION, basic1, basic2, basic3, basic999, basics } from "./basics.js";
import { PEOPLE_COLLECTION, person1 } from "./people.js";
import { expectOrderedItems, expectUnorderedItems } from "./util.js";

/** Options for `testDBProvider()`, declaring the capabilities of the provider under test. */
export interface TestDBProviderOptions {
	/** Whether the provider supports realtime sequences — when `false`, sequences are asserted to throw `UnsupportedError` (including inside `transact()`); when `true` combined with `transactions`, sequences inside a transaction are asserted to observe the transaction and end with it. @default true */
	readonly realtime?: boolean;
	/** Whether the provider supports `transact()` — when `false`, it is asserted to throw `UnsupportedError`. @default false */
	readonly transactions?: boolean;
	/** Whether `transact()` can be nested, committing the inner transaction into the outer — when `false`, nested calls are asserted to throw `UnsupportedError`. @default false */
	readonly nestedTransactions?: boolean;
}

/**
 * Register the universal `DBProvider` contract test suite against a provider, so every backend proves the same behaviour.
 *
 * - Calls `createProvider()` fresh for every test and wipes `BASICS_COLLECTION` and `PEOPLE_COLLECTION` first, so persistent backends (e.g. an emulator) start each test clean.
 * - Declare the provider's capabilities via options — unsupported capabilities are asserted to throw `UnsupportedError` rather than skipped.
 *
 * @param name Name for the provider used in the `describe` block.
 * @param createProvider Create (or return) the provider instance to test.
 * @param options Capability flags for the provider under test.
 * @example testDBProvider("MemoryDBProvider", () => new MemoryDBProvider<string>());
 * @see https://shelving.cc/test/testDBProvider
 */
export function testDBProvider(
	name: string,
	createProvider: () => DBProvider<string, Data> | PromiseLike<DBProvider<string, Data>>,
	{ realtime = true, transactions = false, nestedTransactions = false }: TestDBProviderOptions = {},
): void {
	// Create the provider and wipe both fixture collections so each test starts clean.
	async function init(): Promise<DBProvider<string, Data>> {
		const provider = await createProvider();
		await provider.deleteQuery(BASICS_COLLECTION, {});
		await provider.deleteQuery(PEOPLE_COLLECTION, {});
		return provider;
	}

	describe(`DBProvider contract: ${name}`, () => {
		test("sets, gets, and deletes items", async () => {
			const db = await init();
			// Set and get.
			await db.setItem(BASICS_COLLECTION, "basic1", basic1);
			await db.setItem(BASICS_COLLECTION, "basic2", basic2);
			await db.setItem(PEOPLE_COLLECTION, "person1", person1);
			expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
			expect(await db.getItem(BASICS_COLLECTION, "basic2")).toMatchObject(basic2);
			expect(await db.getItem(BASICS_COLLECTION, "basicNone")).toBe(undefined);
			expect(await db.getItem(PEOPLE_COLLECTION, "person1")).toMatchObject(person1);
			// Overwrite.
			await db.setItem(BASICS_COLLECTION, "basic1", { ...basic1, str: "NEW" });
			expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject({ ...basic1, str: "NEW" });
			// Require.
			expect(await db.requireItem(BASICS_COLLECTION, "basic2")).toMatchObject(basic2);
			try {
				await db.requireItem(BASICS_COLLECTION, "basicNone");
				expect.unreachable();
			} catch (thrown) {
				expect(thrown).toBeInstanceOf(RequiredError);
			}
			// Delete (including a missing item, which is a no-op).
			await db.deleteItem(BASICS_COLLECTION, "basic1");
			await db.deleteItem(BASICS_COLLECTION, "basicNone");
			expect(await db.getItem(BASICS_COLLECTION, "basic1")).toBe(undefined);
			expect(await db.countQuery(BASICS_COLLECTION, {})).toBe(1);
			expect(await db.countQuery(PEOPLE_COLLECTION, {})).toBe(1);
		});

		test("adds items with generated ids", async () => {
			const db = await init();
			const id1 = await db.addItem(BASICS_COLLECTION, basic999);
			const id2 = await db.addItem(BASICS_COLLECTION, basic999);
			expect(typeof id1).toBe("string");
			expect(typeof id2).toBe("string");
			expect(id1).not.toBe(id2);
			expect(await db.getItem(BASICS_COLLECTION, id1)).toMatchObject(basic999);
			expect(await db.countQuery(BASICS_COLLECTION, {})).toBe(2);
		});

		test("updates items with set, sum, and array updates", async () => {
			const db = await init();
			await db.setItem(BASICS_COLLECTION, "basic1", basic1);
			// Set and sum updates.
			await db.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW", "+=num": 100 });
			expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject({ ...basic1, str: "NEW", num: basic1.num + 100 });
			// Array with/omit updates.
			await db.updateItem(BASICS_COLLECTION, "basic1", { "+[]tags": "extra" });
			expect((await db.requireItem(BASICS_COLLECTION, "basic1")).tags).toEqual([...basic1.tags, "extra"]);
			await db.updateItem(BASICS_COLLECTION, "basic1", { "-[]tags": "extra" });
			expect((await db.requireItem(BASICS_COLLECTION, "basic1")).tags).toEqual(basic1.tags);
		});

		test("gets queries with filters", async () => {
			const db = await init();
			for (const { id, ...data } of basics) await db.setItem(BASICS_COLLECTION, id, data);
			// Equality filters.
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { str: "aaa" }), ["basic1"]);
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { str: "NOPE" }), []);
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { num: 300 }), ["basic3"]);
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { group: "a" }), ["basic1", "basic2", "basic3"]);
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { group: "b" }), ["basic4", "basic5", "basic6"]);
			// ArrayContains filters.
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { "tags[]": "odd" }), ["basic1", "basic3", "basic5", "basic7", "basic9"]);
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { "tags[]": "NOPE" }), []);
			// In filters.
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { num: [200, 600, 900, 999999] }), ["basic2", "basic6", "basic9"]);
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { id: ["basic1", "basic5", "basicNone"] }), ["basic1", "basic5"]);
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { num: [] }), []);
			// Range filters.
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { "num<": 300 }), ["basic1", "basic2"]);
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { "num<=": 300 }), ["basic1", "basic2", "basic3"]);
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { "num>": 700 }), ["basic8", "basic9"]);
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { "num>=": 700 }), ["basic7", "basic8", "basic9"]);
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { "str<": "ccc" }), ["basic1", "basic2"]);
		});

		test("gets queries with sorts and limits", async () => {
			const db = await init();
			for (const { id, ...data } of basics) await db.setItem(BASICS_COLLECTION, id, data);
			const keysAsc = ["basic1", "basic2", "basic3", "basic4", "basic5", "basic6", "basic7", "basic8", "basic9"];
			const keysDesc = [...keysAsc].reverse();
			// (Descending `!id` order is omitted — the Firestore emulator rejects descending `__name__` scans, though production Firestore supports them.)
			expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "id" }), keysAsc);
			expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "str" }), keysAsc);
			expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "!str" }), keysDesc);
			expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "num" }), keysAsc);
			expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "!num" }), keysDesc);
			expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "id", $limit: 2 }), ["basic1", "basic2"]);
			expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "!num", $limit: 1 }), ["basic9"]);
			expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { "tags[]": "prime", $order: "!num", $limit: 2 }), ["basic7", "basic5"]);
		});

		test("counts queries", async () => {
			const db = await init();
			for (const { id, ...data } of basics) await db.setItem(BASICS_COLLECTION, id, data);
			expect(await db.countQuery(BASICS_COLLECTION)).toBe(9);
			expect(await db.countQuery(BASICS_COLLECTION, {})).toBe(9);
			expect(await db.countQuery(BASICS_COLLECTION, { group: "a" })).toBe(3);
			expect(await db.countQuery(BASICS_COLLECTION, { str: "NOPE" })).toBe(0);
			expect(await db.countQuery(BASICS_COLLECTION, { $limit: 4 })).toBe(4);
		});

		test("gets first items", async () => {
			const db = await init();
			for (const { id, ...data } of basics) await db.setItem(BASICS_COLLECTION, id, data);
			expect(await db.getFirst(BASICS_COLLECTION, { $order: "num" })).toMatchObject(basic1);
			expect(await db.getFirst(BASICS_COLLECTION, { str: "NOPE", $order: "num" })).toBe(undefined);
			expect(await db.requireFirst(BASICS_COLLECTION, { $order: "num" })).toMatchObject(basic1);
			try {
				await db.requireFirst(BASICS_COLLECTION, { str: "NOPE", $order: "num" });
				expect.unreachable();
			} catch (thrown) {
				expect(thrown).toBeInstanceOf(RequiredError);
			}
		});

		test("sets, updates, and deletes queries", async () => {
			const db = await init();
			for (const { id, ...data } of basics) await db.setItem(BASICS_COLLECTION, id, data);
			// Set every matching item to the same data.
			await db.setQuery(BASICS_COLLECTION, { group: "a" }, basic999);
			expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic999);
			expect(await db.getItem(BASICS_COLLECTION, "basic2")).toMatchObject(basic999);
			expect(await db.getItem(BASICS_COLLECTION, "basic4")).toMatchObject({ id: "basic4", group: "b" }); // Non-matching items unchanged.
			// Update every matching item.
			await db.updateQuery(BASICS_COLLECTION, { group: "b" }, { str: "UPDATED" });
			expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { str: "UPDATED" }), ["basic4", "basic5", "basic6"]);
			// Delete every matching item.
			await db.deleteQuery(BASICS_COLLECTION, { group: "c" });
			expect(await db.countQuery(BASICS_COLLECTION, {})).toBe(6);
			await db.deleteQuery(BASICS_COLLECTION, {});
			expect(await db.countQuery(BASICS_COLLECTION, {})).toBe(0);
		});

		if (realtime) {
			test("subscribes to an item", async () => {
				const db = await init();
				const calls: OptionalItem<string, Data>[] = [];
				const stop = runSequence(db.getItemSequence(BASICS_COLLECTION, "basic1"), v => void calls.push(v));
				await runMicrotasks();
				expect(calls.length).toBe(1);
				expect(calls[0]).toBe(undefined);
				await db.setItem(BASICS_COLLECTION, "basic1", basic1);
				await runMicrotasks();
				expect(calls.length).toBe(2);
				expect(calls[1]).toMatchObject(basic1);
				await db.deleteItem(BASICS_COLLECTION, "basic1");
				await runMicrotasks();
				expect(calls.length).toBe(3);
				expect(calls[2]).toBe(undefined);
				stop();
			});

			test("subscribes to a query", async () => {
				const db = await init();
				const calls: Items<string, Data>[] = [];
				const stop = runSequence(db.getQuerySequence(BASICS_COLLECTION, { $order: "id" }), v => void calls.push(v));
				await runMicrotasks();
				expectOrderedItems(calls[0] ?? [], []);
				await db.setItem(BASICS_COLLECTION, "basic1", basic1);
				await runMicrotasks();
				expectOrderedItems(calls[1] ?? [], ["basic1"]);
				await db.setItem(BASICS_COLLECTION, "basic2", basic2);
				await runMicrotasks();
				expectOrderedItems(calls[2] ?? [], ["basic1", "basic2"]);
				stop();
			});
		} else {
			test("sequences are not supported", async () => {
				const db = await init();
				expect(() => db.getItemSequence(BASICS_COLLECTION, "basic1")).toThrow(UnsupportedError);
				expect(() => db.getQuerySequence(BASICS_COLLECTION, {})).toThrow(UnsupportedError);
			});
		}

		if (transactions) {
			test("transact(): commits reads and writes atomically", async () => {
				const db = await init();
				expect(await db.transact(async () => 123)).toBe(123); // The callback's value is returned.
				await db.setItem(BASICS_COLLECTION, "basic1", basic1);
				await db.setItem(BASICS_COLLECTION, "basic2", basic2);
				const id = await db.transact(async tx => {
					// Reads inside the transaction see committed items.
					expect(await tx.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
					expect(await tx.countQuery(BASICS_COLLECTION, {})).toBe(2);
					expectUnorderedItems(await tx.getQuery(BASICS_COLLECTION, { group: "a" }), ["basic1", "basic2"]);
					// Writes commit together when the callback resolves.
					await tx.setItem(BASICS_COLLECTION, "basic3", basic3);
					await tx.updateItem(BASICS_COLLECTION, "basic1", { str: "TX", "+=num": 1 });
					await tx.deleteItem(BASICS_COLLECTION, "basic2");
					return await tx.addItem(BASICS_COLLECTION, basic999);
				});
				expect(typeof id).toBe("string");
				expect(await db.getItem(BASICS_COLLECTION, "basic3")).toMatchObject(basic3);
				expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject({ ...basic1, str: "TX", num: basic1.num + 1 });
				expect(await db.getItem(BASICS_COLLECTION, "basic2")).toBe(undefined);
				expect(await db.getItem(BASICS_COLLECTION, id)).toMatchObject(basic999);
			});

			test("transact(): commits nothing when the callback throws", async () => {
				const db = await init();
				await db.setItem(BASICS_COLLECTION, "basic1", basic1);
				try {
					await db.transact(async tx => {
						await tx.setItem(BASICS_COLLECTION, "basic2", basic2);
						await tx.deleteItem(BASICS_COLLECTION, "basic1");
						throw new Error("nope");
					});
					expect.unreachable();
				} catch (thrown) {
					expect(thrown).toBeInstanceOf(Error);
					expect((thrown as Error).message).toBe("nope");
				}
				expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
				expect(await db.getItem(BASICS_COLLECTION, "basic2")).toBe(undefined);
			});

			test("transact(): supports query writes", async () => {
				const db = await init();
				for (const { id, ...data } of basics) await db.setItem(BASICS_COLLECTION, id, data);
				await db.transact(async tx => {
					await tx.updateQuery(BASICS_COLLECTION, { group: "a" }, { str: "TX" });
					await tx.deleteQuery(BASICS_COLLECTION, { group: "c" });
				});
				expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { str: "TX" }), ["basic1", "basic2", "basic3"]);
				expect(await db.countQuery(BASICS_COLLECTION, {})).toBe(6);
			});

			// Sequence support inside a transaction follows the `realtime` flag — a provider that supports both capabilities supports them together.
			if (realtime) {
				test("transact(): sequences inside a transaction observe the transaction and end with it", async () => {
					const db = await init();
					await db.setItem(BASICS_COLLECTION, "basic1", basic1);
					const emissions: OptionalItem<string, Data>[] = [];
					let sequence: Promise<void> | undefined;
					await db.transact(async tx => {
						sequence = (async () => {
							for await (const item of tx.getItemSequence(BASICS_COLLECTION, "basic1")) emissions.push(item);
						})();
						await runMicrotasks();
						await tx.updateItem(BASICS_COLLECTION, "basic1", { str: "TX" });
						await runMicrotasks();
					});
					await sequence; // The sequence ends when the transaction completes (this would hang otherwise).
					expect(emissions[0]).toMatchObject(basic1);
					expect(emissions[1]).toMatchObject({ ...basic1, str: "TX" });
					expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject({ ...basic1, str: "TX" });
				});
			} else {
				test("transact(): sequences are unsupported inside a transaction", async () => {
					const db = await init();
					await db.transact(async tx => {
						expect(() => tx.getItemSequence(BASICS_COLLECTION, "basic1")).toThrow(UnsupportedError);
						expect(() => tx.getQuerySequence(BASICS_COLLECTION, {})).toThrow(UnsupportedError);
					});
				});
			}

			if (nestedTransactions) {
				test("transact(): nested transactions commit into the outer transaction", async () => {
					const db = await init();
					await db.transact(async tx => {
						await tx.transact(async nested => {
							await nested.setItem(BASICS_COLLECTION, "basic1", basic1);
						});
						expect(await tx.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1); // The inner commit is visible to the outer transaction…
						expect(await db.getItem(BASICS_COLLECTION, "basic1")).toBe(undefined); // …but not yet committed to the provider.
					});
					expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
				});
			} else {
				test("transact(): nested transactions are unsupported", async () => {
					const db = await init();
					await db.transact(async tx => {
						expect(() => tx.transact(async () => undefined)).toThrow(UnsupportedError);
					});
				});
			}
		} else {
			test("transactions are not supported", async () => {
				const db = await init();
				expect(() => db.transact(async () => undefined)).toThrow(UnsupportedError);
			});
		}
	});
}
