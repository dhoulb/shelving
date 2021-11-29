import { jest } from "@jest/globals";
import {
	TEST_SCHEMAS,
	basicResults,
	peopleResults,
	basic1,
	basic2,
	basic3,
	basic4,
	basic5,
	basic6,
	basic7,
	basic8,
	basic9,
	person1,
	person2,
	person3,
	person4,
	person5,
	expectOrderedKeys,
	expectUnorderedKeys,
	BasicData,
} from "../test/index.js";
import { Database, MemoryProvider, Result, ResultsMap, toArray, toMap } from "../index.js";

test("MemoryProvider: set/get/delete documents", () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const basics = db.query("basics");
	const people = db.query("people");

	// Add documents.
	expect(basics.doc("basic1").set(basic1)).toBe(undefined);
	expect(basics.doc("basic2").set(basic2)).toBe(undefined);
	expect(basics.doc("basic3").set(basic3)).toBe(undefined);
	expect(people.doc("person1").set(person1)).toBe(undefined);
	expect(people.doc("person2").set(person2)).toBe(undefined);
	expect(people.doc("person3").set(person3)).toBe(undefined);
	// Check documents.
	expect(basics.doc("basic1").result).toBe(basic1);
	expect(basics.doc("basic2").result).toBe(basic2);
	expect(basics.doc("basic3").result).toBe(basic3);
	expect(basics.doc("basicNone").result).toBe(undefined);
	expect(basics.count).toBe(3);
	expect(people.doc("person1").result).toBe(person1);
	expect(people.doc("person2").result).toBe(person2);
	expect(people.doc("person3").result).toBe(person3);
	expect(people.doc("peopleNone").result).toBe(undefined);
	expect(people.count).toBe(3);
	// Update documents.
	expect(basics.doc("basic1").update({ str: "NEW" })).toBe(undefined);
	expect(basics.doc("basic1").result).toMatchObject({ ...basic1, str: "NEW" });
	// expect(people.doc("person3").merge({ name: { first: "NEW" } })).toBe(undefined);
	// Merge documents.
	// expect(people.doc("person3").result).toMatchObject({ ...person3, name: { ...person3.name, first: "NEW" } });
	// Add new documents (with random IDs).
	const addedBasicId = basics.add(basic9);
	expect(typeof addedBasicId).toBe("string");
	const addedPersonId = people.add(person5);
	expect(typeof addedPersonId).toBe("string");
	// Delete documents.
	expect(basics.doc("basic2").delete()).toBe(undefined);
	expect(basics.count).toBe(3);
	expect(people.doc("personNone").delete()).toBe(undefined);
	expect(people.doc("person3").delete()).toBe(undefined);
	expect(people.doc("personNone").delete()).toBe(undefined);
	expect(people.count).toBe(3);
});
test("MemoryProvider: set/get/delete collections", () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const basics = db.query("basics");
	const people = db.query("people");
	// Change collections.
	for (const [k, v] of basicResults) basics.doc(k).set(v);
	for (const [k, v] of peopleResults) people.doc(k).set(v);
	// Check collections.
	expect(basics.results).toEqual(basicResults);
	expect(basics.doc("basic1").result).toEqual(basic1);
	expect(basics.doc("basic6").result).toEqual(basic6);
	expect(basics.doc("basicNone").result).toBe(undefined);
	expect(people.results).toEqual(peopleResults);
	expect(people.doc("person4").result).toEqual(person4);
	expect(people.doc("peopleNone").result).toBe(undefined);
	// Delete collections.
	expect(basics.delete()).toBe(undefined);
	expect(people.delete()).toBe(undefined);
	// Check collections.
	expect(people.results).toEqual(new Map());
	expect(basics.results).toEqual(new Map());
});
test("MemoryProvider: get queries", async () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const basics = db.query("basics");
	for (const [k, v] of basicResults) basics.doc(k).set(v);
	// Equal queries.
	expectUnorderedKeys(await basics.is("str", "aaa").results, ["basic1"]);
	expectUnorderedKeys(await basics.is("str", "NOPE").results, []);
	expectUnorderedKeys(await basics.is("num", 300).results, ["basic3"]);
	expectUnorderedKeys(await basics.is("num", 999999).results, []);
	expectUnorderedKeys(await basics.is("group", "a").results, ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(await basics.is("group", "b").results, ["basic4", "basic5", "basic6"]);
	expectUnorderedKeys(await basics.is("group", "c").results, ["basic7", "basic8", "basic9"]);
	// ArrayContains queries.
	expectUnorderedKeys(await basics.contains("tags", "odd").results, ["basic1", "basic3", "basic5", "basic7", "basic9"]);
	expectUnorderedKeys(await basics.contains("tags", "even").results, ["basic2", "basic4", "basic6", "basic8"]);
	expectUnorderedKeys(await basics.contains("tags", "prime").results, ["basic1", "basic2", "basic3", "basic5", "basic7"]);
	expectUnorderedKeys(await basics.contains("tags", "NOPE").results, []);
	// In queries.
	expectUnorderedKeys(await basics.in("num", [200, 600, 900, 999999]).results, ["basic2", "basic6", "basic9"]);
	expectUnorderedKeys(await basics.in("str", ["aaa", "ddd", "eee", "NOPE"]).results, ["basic1", "basic4", "basic5"]);
	expectUnorderedKeys(await basics.in("num", []).results, []);
	expectUnorderedKeys(await basics.in("str", []).results, []);
	// Sorting.
	const keysAsc = toArray(basicResults.keys()).sort();
	const keysDesc = toArray(basicResults.keys()).sort().reverse();
	expectOrderedKeys(await basics.asc().results, keysAsc);
	expectOrderedKeys(await basics.desc().results, keysDesc);
	expectOrderedKeys(await basics.asc("str").results, keysAsc);
	expectOrderedKeys(await basics.desc("str").results, keysDesc);
	expectOrderedKeys(await basics.asc("num").results, keysAsc);
	expectOrderedKeys(await basics.desc("num").results, keysDesc);
	// Limiting.
	expectOrderedKeys(await basics.asc().max(2).results, ["basic1", "basic2"]);
	// Combinations.
	expectOrderedKeys(await basics.asc("id").max(2).results, ["basic1", "basic2"]);
	expectOrderedKeys(await basics.desc("id").max(1).results, ["basic9"]);
	expectOrderedKeys(await basics.contains("tags", "prime").desc("id").max(2).results, ["basic7", "basic5"]);
});
test("MemoryProvider: subscribing to documents", async () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const basics = db.query("basics");
	const doc = basics.doc("basic1");
	// Subscribe.
	const fn1 = jest.fn<void, [Result<BasicData>]>();
	const un1 = doc.subscribe(fn1);
	await Promise.resolve();
	expect(fn1).nthCalledWith(1, undefined);
	// Set.
	doc.set(basic1);
	await Promise.resolve();
	expect(fn1).nthCalledWith(2, basic1);
	// Update.
	doc.update({ str: "NEW" });
	await Promise.resolve();
	expect(fn1).nthCalledWith(3, expect.objectContaining({ ...basic1, str: "NEW" }));
	// Delete.
	doc.delete();
	await Promise.resolve();
	expect(fn1).nthCalledWith(4, undefined);
	// Change unrelated documents.
	expect(fn1).toBeCalledTimes(4);
	basics.doc("basic2").set(basic2);
	basics.doc("basic2").update({ str: "NEW" });
	basics.doc("basic2").delete();
	basics.add(basic3);
	expect(fn1).toBeCalledTimes(4);
	// Unsubscribe.
	expect(un1()).toBe(undefined);
	// Set.
	doc.set(basic1);
	expect(fn1).toBeCalledTimes(4);
});
test("MemoryProvider: subscribing to collections", async () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const basics = db.query("basics");
	// Subscribe fn1.
	const calls1: ResultsMap<BasicData>[] = [];
	const stop1 = basics.subscribeMap(results => void calls1.push(results));
	await Promise.resolve();
	expect(calls1.length).toBe(1);
	expectOrderedKeys(calls1[0]!, []); // Empty at first (no last argument).
	// Add id1.
	const id1 = await basics.add(basic1);
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
	expect(calls1.length).toBe(2);
	expectOrderedKeys(calls1[1]!, [id1]); // id1 is added.
	// Subscribe fn2.
	const calls2: ResultsMap<BasicData>[] = [];
	const stop2 = basics.subscribeMap(results => void calls2.push(results));
	await Promise.resolve();
	expectOrderedKeys(calls2[0]!, [id1]); // Called with current results.
	expect(calls1[2]).toBe(undefined);
	// Set basic2.
	basics.doc("basic2").set(basic2);
	await Promise.resolve();
	expectOrderedKeys(calls1[2]!, [id1, "basic2"]);
	expectOrderedKeys(calls2[1]!, [id1, "basic2"]);
	// Change id1.
	basics.doc(id1).set(basic9);
	await Promise.resolve();
	expectOrderedKeys(calls1[3]!, [id1, "basic2"]);
	expectOrderedKeys(calls2[2]!, [id1, "basic2"]);
	// Add basic3 and basic4
	basics.doc("basic3").set(basic3);
	basics.doc("basic4").set(basic4);
	await Promise.resolve();
	expectOrderedKeys(calls1[4]!, [id1, "basic2", "basic3", "basic4"]);
	expectOrderedKeys(calls2[3]!, [id1, "basic2", "basic3", "basic4"]);
	// Delete basic4.
	basics.doc("basic4").delete();
	await Promise.resolve();
	expectOrderedKeys(calls1[5]!, [id1, "basic2", "basic3"]);
	expectOrderedKeys(calls2[4]!, [id1, "basic2", "basic3"]);
	// Unsubscribe fn2.
	expect(stop2()).toBe(undefined);
	// Change basic3.
	basics.doc("basic3").update({ str: "NEW" });
	await Promise.resolve();
	expectOrderedKeys(calls1[6]!, [id1, "basic2", "basic3"]);
	expect(calls2[5]).toBe(undefined);
	// Unsubscribe fn1.
	expect(stop1()).toBe(undefined);
});
test("MemoryProvider: subscribing to filter query", async () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const basics = db.query("basics");
	basics.doc("basic6").set(basic6);
	basics.doc("basic7").set(basic7);
	// Subscribe (should find only basic7).
	const calls1: ResultsMap<BasicData>[] = [];
	const stop1 = basics.contains("tags", "odd").subscribeMap(results => void calls1.push(results)); // Query for odds.
	await Promise.resolve();
	expectUnorderedKeys(calls1[0]!, ["basic7"]);
	// Set basic3 (should be added to result).
	basics.doc("basic3").set(basic3);
	await Promise.resolve();
	expectUnorderedKeys(calls1[1]!, ["basic3", "basic7"]);
	// Set basic2 (shouldn't call fn1).
	basics.doc("basic2").set(basic2);
	await Promise.resolve();
	expect(calls1[3]).toBe(undefined);
	// Change basic2 and basic3 (should have updated basic3 in result).
	basics.in("id", ["basic2", "basic3"]).update({ str: "NEW" });
	await Promise.resolve();
	expectUnorderedKeys(calls1[2]!, ["basic3", "basic7"]);
	// Delete basic3 and basic2.
	basics.doc("basic2").delete();
	basics.doc("basic3").delete();
	await Promise.resolve();
	expectUnorderedKeys(calls1[3]!, ["basic7"]);
	// Unsubscribe fn1.
	expect(stop1()).toBe(undefined);
	// Check end result.
	expectUnorderedKeys(await basics.results, ["basic6", "basic7"]);
});
test("MemoryProvider: subscribing to sort and limit query", async () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const basics = db.query("basics");
	for (const [k, v] of basicResults) basics.doc(k).set(v);
	// Subscribe (should find only basic7).
	const calls1: ResultsMap<BasicData>[] = [];
	const stop1 = basics
		.asc("num")
		.max(2)
		.subscribeMap(result => void calls1.push(result));
	await Promise.resolve();
	expectOrderedKeys(calls1[0]!, ["basic1", "basic2"]);
	// Delete basic9 (shouldn't affect result as it's outside the slice).
	basics.doc("basic9").delete();
	await Promise.resolve();
	expect(calls1[1]).toBe(undefined);
	// Delete basic1 (should be removed from result, which brings in basic3).
	basics.doc("basic1").delete();
	await Promise.resolve();
	expectOrderedKeys(calls1[1]!, ["basic2", "basic3"]);
	// Change basic2 and basic3 (should have updated basic3 in result).
	basics.doc("basic2").update({ str: "NEW" });
	basics.doc("basic8").update({ str: "NEW" });
	await Promise.resolve();
	expectOrderedKeys(calls1[2]!, ["basic2", "basic3"]);
	// Add a new one at the start.
	const id1 = await basics.add({ str: "NEW", num: 0, group: "a", tags: [] });
	await Promise.resolve();
	expectOrderedKeys(calls1[3]!, [id1, "basic2"]);
	// Delete everything.
	basics.delete();
	await Promise.resolve();
	expectOrderedKeys(calls1[4]!, []);
	// Set basic8.
	basics.doc("basic8").set(basic8);
	await Promise.resolve();
	expectOrderedKeys(calls1[5]!, ["basic8"]);
	// Unsubscribe fn1.
	expect(stop1()).toBe(undefined);
	// Delete basic8 (shouldn't call fn1).
	basics.doc("basic8").delete();
	await Promise.resolve();
	expect(calls1[6]).toBe(undefined);
	// Check end result.
	expectUnorderedKeys(await basics.results, []);
});
