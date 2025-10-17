import { expect, test } from "bun:test";
import { type ImmutableArray, type Item, MemoryProvider, type OptionalItem, runMicrotasks, runSequence } from "../index.js";
import {
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
	type PersonData,
	people,
	person1,
	person2,
	person3,
	person4,
	person5,
	type TestCollections,
} from "../test/index.js";

test("MemoryProvider: set/get/delete documents", () => {
	// Setup.
	const db = new MemoryProvider<string, TestCollections>();

	// Add documents.
	db.setItem("basics", "basic1", basic1);
	db.setItem("basics", "basic2", basic2);
	db.setItem("basics", "basic3", basic3);
	db.setItem("people", "person1", person1);
	db.setItem("people", "person2", person2);
	db.setItem("people", "person3", person3);
	// Check documents.
	expect(db.getItem("basics", "basic1")).toMatchObject(basic1);
	expect(db.getItem("basics", "basic2")).toMatchObject(basic2);
	expect(db.getItem("basics", "basic3")).toMatchObject(basic3);
	expect<Item<string, BasicData> | undefined>(db.getItem("basics", "basicNone")).toBe(undefined);
	expect(db.countQuery("basics", {})).toBe(3);
	expect(db.getItem("people", "person1")).toMatchObject(person1);
	expect(db.getItem("people", "person2")).toMatchObject(person2);
	expect(db.getItem("people", "person3")).toMatchObject(person3);
	expect<Item<string, PersonData> | undefined>(db.getItem("people", "peopleNone")).toBe(undefined);
	expect(db.countQuery("people", {})).toBe(3);
	// Update documents.
	db.updateItem("basics", "basic1", { str: "NEW" });
	expect(db.getItem("basics", "basic1")).toMatchObject({ ...basic1, str: "NEW" });
	// collectionpeople.item("person3").merge({ name: { first: "NEW" } })).toBe(undefined);
	// Merge documents.
	// collectionpeople.item("person3").result).toMatchObject({ ...person3, name: { ...person3.name, first: "NEW" } });
	// Add new documents (with random IDs).
	const addedBasicId = db.addItem("basics", basic9);
	expect(typeof addedBasicId).toBe("string");
	const addedPersonId = db.addItem("people", person5);
	expect(typeof addedPersonId).toBe("string");
	// Delete documents.
	db.deleteItem("basics", "basic2");
	expect(db.countQuery("basics", {})).toBe(3);
	db.deleteItem("people", "personNone");
	db.deleteItem("people", "person3");
	expect(db.countQuery("people", {})).toBe(3);
});
test("MemoryProvider: set/get/delete collections", () => {
	// Setup.
	const db = new MemoryProvider<string, TestCollections>();
	// Change collections.
	for (const { id, ...data } of basics) db.setItem("basics", id, data);
	for (const { id, ...data } of people) db.setItem("people", id, data);
	// Check collections.
	expect(db.getQuery("basics", {})).toEqual(basics);
	expect(db.getItem("basics", "basic1")).toMatchObject(basic1);
	expect(db.getItem("basics", "basic6")).toMatchObject(basic6);
	expect<Item<string, BasicData> | undefined>(db.getItem("basics", "basicNone")).toBe(undefined);
	expect(db.getQuery("people", {})).toEqual(people);
	expect(db.getItem("people", "person4")).toMatchObject(person4);
	expect<Item<string, PersonData> | undefined>(db.getItem("people", "peopleNone")).toBe(undefined);
	// Delete collections.
	db.deleteQuery("basics", {});
	db.deleteQuery("people", {});
	// Check collections.
	expect(db.getQuery("basics", {})).toEqual([]);
	expect(db.getQuery("people", {})).toEqual([]);
});
test("MemoryProvider: get queries", () => {
	// Setup.
	const db = new MemoryProvider<string, TestCollections>();
	for (const { id, ...data } of basics) db.setItem("basics", id, data);
	// Equal queries.
	expectUnorderedItems(db.getQuery("basics", { str: "aaa" }), ["basic1"]);
	expectUnorderedItems(db.getQuery("basics", { str: "NOPE" }), []);
	expectUnorderedItems(db.getQuery("basics", { num: 300 }), ["basic3"]);
	expectUnorderedItems(db.getQuery("basics", { num: 999999 }), []);
	expectUnorderedItems(db.getQuery("basics", { group: "a" }), ["basic1", "basic2", "basic3"]);
	expectUnorderedItems(db.getQuery("basics", { group: "b" }), ["basic4", "basic5", "basic6"]);
	expectUnorderedItems(db.getQuery("basics", { group: "c" }), ["basic7", "basic8", "basic9"]);
	// ArrayContains queries.
	expectUnorderedItems(db.getQuery("basics", { "tags[]": "odd" }), ["basic1", "basic3", "basic5", "basic7", "basic9"]);
	expectUnorderedItems(db.getQuery("basics", { "tags[]": "even" }), ["basic2", "basic4", "basic6", "basic8"]);
	expectUnorderedItems(db.getQuery("basics", { "tags[]": "prime" }), ["basic1", "basic2", "basic3", "basic5", "basic7"]);
	expectUnorderedItems(db.getQuery("basics", { "tags[]": "NOPE" }), []);
	// In queries.
	expectUnorderedItems(db.getQuery("basics", { num: [200, 600, 900, 999999] }), ["basic2", "basic6", "basic9"]);
	expectUnorderedItems(db.getQuery("basics", { str: ["aaa", "ddd", "eee", "NOPE"] }), ["basic1", "basic4", "basic5"]);
	expectUnorderedItems(db.getQuery("basics", { num: [] }), []);
	expectUnorderedItems(db.getQuery("basics", { str: [] }), []);
	// Sorting.
	const keysAsc = ["basic1", "basic2", "basic3", "basic4", "basic5", "basic6", "basic7", "basic8", "basic9"];
	const keysDesc = ["basic9", "basic8", "basic7", "basic6", "basic5", "basic4", "basic3", "basic2", "basic1"];
	expectOrderedItems(db.getQuery("basics", { $order: "id" }), keysAsc);
	expectOrderedItems(db.getQuery("basics", { $order: "!id" }), keysDesc);
	expectOrderedItems(db.getQuery("basics", { $order: "str" }), keysAsc);
	expectOrderedItems(db.getQuery("basics", { $order: "!str" }), keysDesc);
	expectOrderedItems(db.getQuery("basics", { $order: "num" }), keysAsc);
	expectOrderedItems(db.getQuery("basics", { $order: "!num" }), keysDesc);
	// Combinations.
	expectOrderedItems(db.getQuery("basics", { $order: "id", $limit: 2 }), ["basic1", "basic2"]);
	expectOrderedItems(db.getQuery("basics", { $order: "!id", $limit: 1 }), ["basic9"]);
	expectOrderedItems(db.getQuery("basics", { "tags[]": "prime", $order: "!id", $limit: 2 }), ["basic7", "basic5"]);
});
test("MemoryProvider: subscribing to documents", async () => {
	// Setup.
	const db = new MemoryProvider<string, TestCollections>();
	// Subscribe.
	const calls1: OptionalItem<string, BasicData>[] = [];
	const un1 = runSequence(db.getItemSequence("basics", "basic1"), v => calls1.push(v));
	await runMicrotasks();
	expect(calls1.length).toBe(1);
	expect<Item<string, BasicData> | undefined>(calls1[0]).toBe(undefined);
	// Set.
	db.setItem("basics", "basic1", basic1);
	await runMicrotasks();
	expect(calls1.length).toBe(2);
	expect(calls1[1]).toMatchObject(basic1);
	// Update.
	db.updateItem("basics", "basic1", { str: "NEW" });
	await runMicrotasks();
	expect(calls1.length).toBe(3);
	expect(calls1[2]).toMatchObject({ ...basic1, str: "NEW" });
	// Delete.
	db.deleteItem("basics", "basic1");
	await runMicrotasks();
	expect<Item<string, BasicData> | undefined>(calls1[3]).toBe(undefined);
	// Change unrelated documents.
	db.setItem("basics", "basic2", basic2);
	db.updateItem("basics", "basic2", { str: "NEW" });
	db.deleteItem("basics", "basic2");
	db.addItem("basics", basic3);
	await runMicrotasks();
	expect(calls1.length).toBe(4);
	// Unsubscribe.
	expect(un1()).toBe(undefined);
	// Set.
	db.setItem("basics", "basic1", basic1);
	await runMicrotasks();
	expect(calls1.length).toBe(4);
});
test("MemoryProvider: subscribing to collections", async () => {
	// Setup.
	const db = new MemoryProvider<string, TestCollections>();
	// Subscribe fn1.
	const calls1: ImmutableArray<Item<string, BasicData>>[] = [];
	const stop1 = runSequence(db.getQuerySequence("basics", {}), results => void calls1.push(results));
	await runMicrotasks();
	expect(calls1.length).toBe(1);
	expectOrderedItems(calls1[0]!, []); // Empty at first (no last argument).
	// Add id1.
	const id1 = db.addItem("basics", basic1);
	await runMicrotasks();
	expect(calls1.length).toBe(2);
	expectOrderedItems(calls1[1]!, [id1]); // id1 is added.
	// Subscribe fn2.
	const calls2: ImmutableArray<Item<string, BasicData>>[] = [];
	const stop2 = runSequence(db.getQuerySequence("basics", {}), results => void calls2.push(results));
	await runMicrotasks();
	expectOrderedItems(calls2[0]!, [id1]); // Called with current results.
	expect<ImmutableArray<Item<string, BasicData>> | undefined>(calls1[2]).toBe(undefined);
	// Set basic2.
	db.setItem("basics", "basic2", basic2);
	await runMicrotasks();
	expectOrderedItems(calls1[2]!, [id1, "basic2"]);
	expectOrderedItems(calls2[1]!, [id1, "basic2"]);
	// Change id1.
	db.setItem("basics", id1, basic9);
	await runMicrotasks();
	expectOrderedItems(calls1[3]!, [id1, "basic2"]);
	expectOrderedItems(calls2[2]!, [id1, "basic2"]);
	// Add basic3 and basic4
	db.setItem("basics", "basic3", basic3);
	db.setItem("basics", "basic4", basic4);
	await runMicrotasks();
	expectOrderedItems(calls1[4]!, [id1, "basic2", "basic3", "basic4"]);
	expectOrderedItems(calls2[3]!, [id1, "basic2", "basic3", "basic4"]);
	// Delete basic4.
	db.deleteItem("basics", "basic4");
	await runMicrotasks();
	expectOrderedItems(calls1[5]!, [id1, "basic2", "basic3"]);
	expectOrderedItems(calls2[4]!, [id1, "basic2", "basic3"]);
	// Unsubscribe fn2.
	expect(stop2()).toBe(undefined);
	// Change basic3.
	db.updateItem("basics", "basic3", { str: "NEW" });
	await runMicrotasks();
	expectOrderedItems(calls1[6]!, [id1, "basic2", "basic3"]);
	expect<ImmutableArray<Item<string, BasicData>> | undefined>(calls2[6]).toBe(undefined);
	// Unsubscribe fn1.
	expect(stop1()).toBe(undefined);
});
test("MemoryProvider: subscribing to filter query", async () => {
	// Setup.
	const db = new MemoryProvider<string, TestCollections>();
	db.setItem("basics", "basic6", basic6);
	db.setItem("basics", "basic7", basic7);
	// Subscribe (should find only basic7).
	const calls1: ImmutableArray<Item<string, BasicData>>[] = [];
	const stop1 = runSequence(db.getQuerySequence("basics", { "tags[]": "odd" }), results => void calls1.push(results)); // Query for odds.
	await runMicrotasks();
	expectUnorderedItems(calls1[0]!, ["basic7"]);
	// Set basic3 (should be added to result).
	db.setItem("basics", "basic3", basic3);
	await runMicrotasks();
	expectUnorderedItems(calls1[1]!, ["basic3", "basic7"]);
	// Set basic2 (shouldn't call fn1).
	db.setItem("basics", "basic2", basic2);
	await runMicrotasks();
	expect<ImmutableArray<Item<string, BasicData>> | undefined>(calls1[3]).toBe(undefined);
	// Change basic2 and basic3 (should have updated basic3 in result).
	db.updateQuery("basics", { id: ["basic2", "basic3"] }, { str: "NEW" });
	await runMicrotasks();
	expectUnorderedItems(calls1[2]!, ["basic3", "basic7"]);
	// Delete basic3 and basic2.
	db.deleteItem("basics", "basic2");
	db.deleteItem("basics", "basic3");
	await runMicrotasks();
	expectUnorderedItems(calls1[3]!, ["basic7"]);
	// Unsubscribe fn1.
	await runMicrotasks();
	expect(stop1()).toBe(undefined);
	// Check end result.
	await runMicrotasks();
	expectUnorderedItems(db.getQuery("basics", {}), ["basic6", "basic7"]);
});
test("MemoryProvider: subscribing to sort and limit query", async () => {
	// Setup.
	const db = new MemoryProvider<string, TestCollections>();
	for (const { id, ...data } of basics) db.setItem("basics", id, data);
	// Subscribe (should find only basic7).
	const calls1: ImmutableArray<Item<string, BasicData>>[] = [];
	const stop1 = runSequence(db.getQuerySequence("basics", { $order: "num", $limit: 2 }), arr => void calls1.push(arr));
	await runMicrotasks();
	expectOrderedItems(calls1[0]!, ["basic1", "basic2"]);
	// Delete basic9 (shouldn't affect result as it's outside the slice).
	db.deleteItem("basics", "basic9");
	await runMicrotasks();
	expect<ImmutableArray<Item<string, BasicData>> | undefined>(calls1[1]).toBe(undefined);
	// Delete basic1 (should be removed from result, which brings in basic3).
	db.deleteItem("basics", "basic1");
	await runMicrotasks();
	expectOrderedItems(calls1[1]!, ["basic2", "basic3"]);
	// Change basic2 and basic3 (should have updated basic3 in result).
	db.updateItem("basics", "basic2", { str: "NEW" });
	db.updateItem("basics", "basic8", { str: "NEW" });
	await runMicrotasks();
	expectOrderedItems(calls1[2]!, ["basic2", "basic3"]);
	// Add a new one at the start.
	const id1 = db.addItem("basics", { ...basic999, num: 0 });
	await runMicrotasks();
	expectOrderedItems(calls1[3]!, [id1, "basic2"]);
	// Delete everything.
	db.deleteQuery("basics", {});
	await runMicrotasks();
	expectOrderedItems(calls1[4]!, []);
	// Set basic8.
	db.setItem("basics", "basic8", basic8);
	await runMicrotasks();
	expectOrderedItems(calls1[5]!, ["basic8"]);
	// Unsubscribe fn1.
	await runMicrotasks();
	expect(stop1()).toBe(undefined);
	// Delete basic8 (shouldn't call fn1).
	db.deleteItem("basics", "basic8");
	await runMicrotasks();
	expect<ImmutableArray<Item<string, BasicData>> | undefined>(calls1[6]).toBe(undefined);
	// Check end result.
	await runMicrotasks();
	expectUnorderedItems(db.getQuery("basics", {}), []);
});
