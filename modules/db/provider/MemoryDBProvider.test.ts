import { expect, test } from "bun:test";
import { type ImmutableArray, type Item, MemoryDBProvider, type OptionalItem, runMicrotasks, runSequence } from "../../index.js";
import {
	BASICS_COLLECTION,
	type BasicData,
	basic1,
	basic2,
	basic3,
	basic4,
	basic6,
	basic7,
	basic8,
	basic9,
	basic999,
	basics,
	expectOrderedItems,
	expectUnorderedItems,
	PEOPLE_COLLECTION,
	type PersonData,
	people,
	person1,
	person2,
	person3,
	person4,
	person5,
} from "../../test/index.js";

test("MemoryDBProvider: set/get/delete documents", async () => {
	// Setup.
	const db = new MemoryDBProvider<string>();

	// Add documents.
	await db.setItem(BASICS_COLLECTION, "basic1", basic1);
	await db.setItem(BASICS_COLLECTION, "basic2", basic2);
	await db.setItem(BASICS_COLLECTION, "basic3", basic3);
	await db.setItem(PEOPLE_COLLECTION, "person1", person1);
	await db.setItem(PEOPLE_COLLECTION, "person2", person2);
	await db.setItem(PEOPLE_COLLECTION, "person3", person3);
	// Check documents.
	expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
	expect(await db.getItem(BASICS_COLLECTION, "basic2")).toMatchObject(basic2);
	expect(await db.getItem(BASICS_COLLECTION, "basic3")).toMatchObject(basic3);
	expect<Item<string, BasicData> | undefined>(await db.getItem(BASICS_COLLECTION, "basicNone")).toBe(undefined);
	expect(await db.countQuery(BASICS_COLLECTION, {})).toBe(3);
	expect(await db.getItem(PEOPLE_COLLECTION, "person1")).toMatchObject(person1);
	expect(await db.getItem(PEOPLE_COLLECTION, "person2")).toMatchObject(person2);
	expect(await db.getItem(PEOPLE_COLLECTION, "person3")).toMatchObject(person3);
	expect<Item<string, PersonData> | undefined>(await db.getItem(PEOPLE_COLLECTION, "peopleNone")).toBe(undefined);
	expect(await db.countQuery(PEOPLE_COLLECTION, {})).toBe(3);
	// Update documents.
	await db.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" });
	expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject({ ...basic1, str: "NEW" });
	// Add new documents (with random IDs).
	const addedBasicId = await db.addItem(BASICS_COLLECTION, basic9);
	expect(typeof addedBasicId).toBe("string");
	const addedPersonId = await db.addItem(PEOPLE_COLLECTION, person5);
	expect(typeof addedPersonId).toBe("string");
	// Delete documents.
	await db.deleteItem(BASICS_COLLECTION, "basic2");
	expect(await db.countQuery(BASICS_COLLECTION, {})).toBe(3);
	await db.deleteItem(PEOPLE_COLLECTION, "personNone");
	await db.deleteItem(PEOPLE_COLLECTION, "person3");
	expect(await db.countQuery(PEOPLE_COLLECTION, {})).toBe(3);
});
test("MemoryDBProvider: set/get/delete collections", async () => {
	// Setup.
	const db = new MemoryDBProvider<string>();
	// Change collections.
	for (const { id, ...data } of basics) await db.setItem(BASICS_COLLECTION, id, data);
	for (const { id, ...data } of people) await db.setItem(PEOPLE_COLLECTION, id, data);
	// Check collections.
	expect(await db.getQuery(BASICS_COLLECTION, {})).toEqual(basics);
	expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
	expect(await db.getItem(BASICS_COLLECTION, "basic6")).toMatchObject(basic6);
	expect<Item<string, BasicData> | undefined>(await db.getItem(BASICS_COLLECTION, "basicNone")).toBe(undefined);
	expect(await db.getQuery(PEOPLE_COLLECTION, {})).toEqual(people);
	expect(await db.getItem(PEOPLE_COLLECTION, "person4")).toMatchObject(person4);
	expect<Item<string, PersonData> | undefined>(await db.getItem(PEOPLE_COLLECTION, "peopleNone")).toBe(undefined);
	// Delete collections.
	await db.deleteQuery(BASICS_COLLECTION, {});
	await db.deleteQuery(PEOPLE_COLLECTION, {});
	// Check collections.
	expect(await db.getQuery(BASICS_COLLECTION, {})).toEqual([]);
	expect(await db.getQuery(PEOPLE_COLLECTION, {})).toEqual([]);
});
test("MemoryDBProvider: get queries", async () => {
	// Setup.
	const db = new MemoryDBProvider<string>();
	for (const { id, ...data } of basics) await db.setItem(BASICS_COLLECTION, id, data);
	// Equal queries.
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { str: "aaa" }), ["basic1"]);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { str: "NOPE" }), []);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { num: 300 }), ["basic3"]);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { num: 999999 }), []);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { group: "a" }), ["basic1", "basic2", "basic3"]);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { group: "b" }), ["basic4", "basic5", "basic6"]);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { group: "c" }), ["basic7", "basic8", "basic9"]);
	// ArrayContains queries.
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { "tags[]": "odd" }), ["basic1", "basic3", "basic5", "basic7", "basic9"]);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { "tags[]": "even" }), ["basic2", "basic4", "basic6", "basic8"]);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { "tags[]": "prime" }), ["basic1", "basic2", "basic3", "basic5", "basic7"]);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { "tags[]": "NOPE" }), []);
	// In queries.
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { num: [200, 600, 900, 999999] }), ["basic2", "basic6", "basic9"]);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { str: ["aaa", "ddd", "eee", "NOPE"] }), ["basic1", "basic4", "basic5"]);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { num: [] }), []);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { str: [] }), []);
	// Sorting.
	const keysAsc = ["basic1", "basic2", "basic3", "basic4", "basic5", "basic6", "basic7", "basic8", "basic9"];
	const keysDesc = ["basic9", "basic8", "basic7", "basic6", "basic5", "basic4", "basic3", "basic2", "basic1"];
	expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "id" }), keysAsc);
	expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "!id" }), keysDesc);
	expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "str" }), keysAsc);
	expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "!str" }), keysDesc);
	expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "num" }), keysAsc);
	expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "!num" }), keysDesc);
	// Combinations.
	expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "id", $limit: 2 }), ["basic1", "basic2"]);
	expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { $order: "!id", $limit: 1 }), ["basic9"]);
	expectOrderedItems(await db.getQuery(BASICS_COLLECTION, { "tags[]": "prime", $order: "!id", $limit: 2 }), ["basic7", "basic5"]);
});
test("MemoryDBProvider: subscribing to documents", async () => {
	// Setup.
	const db = new MemoryDBProvider<string>();
	// Subscribe.
	const calls1: OptionalItem<string, BasicData>[] = [];
	const un1 = runSequence(db.getItemSequence(BASICS_COLLECTION, "basic1"), v => calls1.push(v));
	await runMicrotasks();
	expect(calls1.length).toBe(1);
	expect<Item<string, BasicData> | undefined>(calls1[0]).toBe(undefined);
	// Set.
	await db.setItem(BASICS_COLLECTION, "basic1", basic1);
	await runMicrotasks();
	expect(calls1.length).toBe(2);
	expect(calls1[1]).toMatchObject(basic1);
	// Update.
	await db.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" });
	await runMicrotasks();
	expect(calls1.length).toBe(3);
	expect(calls1[2]).toMatchObject({ ...basic1, str: "NEW" });
	// Delete.
	await db.deleteItem(BASICS_COLLECTION, "basic1");
	await runMicrotasks();
	expect<Item<string, BasicData> | undefined>(calls1[3]).toBe(undefined);
	// Change unrelated documents.
	await db.setItem(BASICS_COLLECTION, "basic2", basic2);
	await db.updateItem(BASICS_COLLECTION, "basic2", { str: "NEW" });
	await db.deleteItem(BASICS_COLLECTION, "basic2");
	await db.addItem(BASICS_COLLECTION, basic3);
	await runMicrotasks();
	expect(calls1.length).toBe(4);
	// Unsubscribe.
	expect(un1()).toBe(undefined);
	// Set.
	await db.setItem(BASICS_COLLECTION, "basic1", basic1);
	await runMicrotasks();
	expect(calls1.length).toBe(4);
});
test("MemoryDBProvider: subscribing to collections", async () => {
	// Setup.
	const db = new MemoryDBProvider<string>();
	// Subscribe fn1.
	const calls1: ImmutableArray<Item<string, BasicData>>[] = [];
	const stop1 = runSequence(db.getQuerySequence(BASICS_COLLECTION, {}), results => void calls1.push(results));
	await runMicrotasks();
	expect(calls1.length).toBe(1);
	expectOrderedItems(calls1[0]!, []); // Empty at first (no last argument).
	// Add id1.
	const id1 = await db.addItem(BASICS_COLLECTION, basic1);
	await runMicrotasks();
	expect(calls1.length).toBe(2);
	expectOrderedItems(calls1[1]!, [id1]); // id1 is added.
	// Subscribe fn2.
	const calls2: ImmutableArray<Item<string, BasicData>>[] = [];
	const stop2 = runSequence(db.getQuerySequence(BASICS_COLLECTION, {}), results => void calls2.push(results));
	await runMicrotasks();
	expectOrderedItems(calls2[0]!, [id1]); // Called with current results.
	expect<ImmutableArray<Item<string, BasicData>> | undefined>(calls1[2]).toBe(undefined);
	// Set basic2.
	await db.setItem(BASICS_COLLECTION, "basic2", basic2);
	await runMicrotasks();
	expectOrderedItems(calls1[2]!, [id1, "basic2"]);
	expectOrderedItems(calls2[1]!, [id1, "basic2"]);
	// Change id1.
	await db.setItem(BASICS_COLLECTION, id1, basic9);
	await runMicrotasks();
	expectOrderedItems(calls1[3]!, [id1, "basic2"]);
	expectOrderedItems(calls2[2]!, [id1, "basic2"]);
	// Add basic3 and basic4
	await db.setItem(BASICS_COLLECTION, "basic3", basic3);
	await db.setItem(BASICS_COLLECTION, "basic4", basic4);
	await runMicrotasks();
	expectOrderedItems(calls1[4]!, [id1, "basic2", "basic3", "basic4"]);
	expectOrderedItems(calls2[3]!, [id1, "basic2", "basic3", "basic4"]);
	// Delete basic4.
	await db.deleteItem(BASICS_COLLECTION, "basic4");
	await runMicrotasks();
	expectOrderedItems(calls1[5]!, [id1, "basic2", "basic3"]);
	expectOrderedItems(calls2[4]!, [id1, "basic2", "basic3"]);
	// Unsubscribe fn2.
	expect(stop2()).toBe(undefined);
	// Change basic3.
	await db.updateItem(BASICS_COLLECTION, "basic3", { str: "NEW" });
	await runMicrotasks();
	expectOrderedItems(calls1[6]!, [id1, "basic2", "basic3"]);
	expect<ImmutableArray<Item<string, BasicData>> | undefined>(calls2[6]).toBe(undefined);
	// Unsubscribe fn1.
	expect(stop1()).toBe(undefined);
});
test("MemoryDBProvider: subscribing to filter query", async () => {
	// Setup.
	const db = new MemoryDBProvider<string>();
	await db.setItem(BASICS_COLLECTION, "basic6", basic6);
	await db.setItem(BASICS_COLLECTION, "basic7", basic7);
	// Subscribe (should find only basic7).
	const calls1: ImmutableArray<Item<string, BasicData>>[] = [];
	const stop1 = runSequence(db.getQuerySequence(BASICS_COLLECTION, { "tags[]": "odd" }), results => void calls1.push(results)); // Query for odds.
	await runMicrotasks();
	expectUnorderedItems(calls1[0]!, ["basic7"]);
	// Set basic3 (should be added to result).
	await db.setItem(BASICS_COLLECTION, "basic3", basic3);
	await runMicrotasks();
	expectUnorderedItems(calls1[1]!, ["basic3", "basic7"]);
	// Set basic2 (shouldn't call fn1).
	await db.setItem(BASICS_COLLECTION, "basic2", basic2);
	await runMicrotasks();
	expect<ImmutableArray<Item<string, BasicData>> | undefined>(calls1[3]).toBe(undefined);
	// Change basic2 and basic3 (should have updated basic3 in result).
	await db.updateQuery(BASICS_COLLECTION, { id: ["basic2", "basic3"] }, { str: "NEW" });
	await runMicrotasks();
	expectUnorderedItems(calls1[2]!, ["basic3", "basic7"]);
	// Delete basic3 and basic2.
	await db.deleteItem(BASICS_COLLECTION, "basic2");
	await db.deleteItem(BASICS_COLLECTION, "basic3");
	await runMicrotasks();
	expectUnorderedItems(calls1[3]!, ["basic7"]);
	// Unsubscribe fn1.
	await runMicrotasks();
	expect(stop1()).toBe(undefined);
	// Check end result.
	await runMicrotasks();
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, {}), ["basic6", "basic7"]);
});
test("MemoryDBProvider: subscribing to sort and limit query", async () => {
	// Setup.
	const db = new MemoryDBProvider<string>();
	for (const { id, ...data } of basics) await db.setItem(BASICS_COLLECTION, id, data);
	// Subscribe (should find only basic7).
	const calls1: ImmutableArray<Item<string, BasicData>>[] = [];
	const stop1 = runSequence(db.getQuerySequence(BASICS_COLLECTION, { $order: "num", $limit: 2 }), arr => void calls1.push(arr));
	await runMicrotasks();
	expectOrderedItems(calls1[0]!, ["basic1", "basic2"]);
	// Delete basic9 (shouldn't affect result as it's outside the slice).
	await db.deleteItem(BASICS_COLLECTION, "basic9");
	await runMicrotasks();
	expect<ImmutableArray<Item<string, BasicData>> | undefined>(calls1[1]).toBe(undefined);
	// Delete basic1 (should be removed from result, which brings in basic3).
	await db.deleteItem(BASICS_COLLECTION, "basic1");
	await runMicrotasks();
	expectOrderedItems(calls1[1]!, ["basic2", "basic3"]);
	// Change basic2 and basic3 (should have updated basic3 in result).
	await db.updateItem(BASICS_COLLECTION, "basic2", { str: "NEW" });
	await db.updateItem(BASICS_COLLECTION, "basic8", { str: "NEW" });
	await runMicrotasks();
	expectOrderedItems(calls1[2]!, ["basic2", "basic3"]);
	// Add a new one at the start.
	const id1 = await db.addItem(BASICS_COLLECTION, { ...basic999, num: 0 });
	await runMicrotasks();
	expectOrderedItems(calls1[3]!, [id1, "basic2"]);
	// Delete everything.
	await db.deleteQuery(BASICS_COLLECTION, {});
	await runMicrotasks();
	expectOrderedItems(calls1[4]!, []);
	// Set basic8.
	await db.setItem(BASICS_COLLECTION, "basic8", basic8);
	await runMicrotasks();
	expectOrderedItems(calls1[5]!, ["basic8"]);
	// Unsubscribe fn1.
	await runMicrotasks();
	expect(stop1()).toBe(undefined);
	// Delete basic8 (shouldn't call fn1).
	await db.deleteItem(BASICS_COLLECTION, "basic8");
	await runMicrotasks();
	expect<ImmutableArray<Item<string, BasicData>> | undefined>(calls1[6]).toBe(undefined);
	// Check end result.
	await runMicrotasks();
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, {}), []);
});
