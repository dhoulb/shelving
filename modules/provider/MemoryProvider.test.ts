import { TEST_SCHEMAS, basics, people, basic1, basic2, basic3, basic4, basic5, basic6, basic7, basic8, basic9, person1, person2, person3, person4, person5, expectOrderedKeys, expectUnorderedKeys, BasicEntity } from "../test/index.js";
import { Database, MemoryProvider, OptionalData, ImmutableArray, yieldProps } from "../index.js";

test("MemoryProvider: set/get/delete documents", () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const queryBasics = db.query("basics");
	const queryPeople = db.query("people");

	// Add documents.
	expect(queryBasics.doc("basic1").set(basic1)).toBe(undefined);
	expect(queryBasics.doc("basic2").set(basic2)).toBe(undefined);
	expect(queryBasics.doc("basic3").set(basic3)).toBe(undefined);
	expect(queryPeople.doc("person1").set(person1)).toBe(undefined);
	expect(queryPeople.doc("person2").set(person2)).toBe(undefined);
	expect(queryPeople.doc("person3").set(person3)).toBe(undefined);
	// Check documents.
	expect(queryBasics.doc("basic1").value).toMatchObject(basic1);
	expect(queryBasics.doc("basic2").value).toMatchObject(basic2);
	expect(queryBasics.doc("basic3").value).toMatchObject(basic3);
	expect(queryBasics.doc("basicNone").value).toBe(null);
	expect(queryBasics.count).toBe(3);
	expect(queryPeople.doc("person1").value).toMatchObject(person1);
	expect(queryPeople.doc("person2").value).toMatchObject(person2);
	expect(queryPeople.doc("person3").value).toMatchObject(person3);
	expect(queryPeople.doc("peopleNone").value).toBe(null);
	expect(queryPeople.count).toBe(3);
	// Update documents.
	expect(queryBasics.doc("basic1").update({ str: "NEW" })).toBe(undefined);
	expect(queryBasics.doc("basic1").value).toMatchObject({ ...basic1, str: "NEW" });
	// expect(people.doc("person3").merge({ name: { first: "NEW" } })).toBe(undefined);
	// Merge documents.
	// expect(people.doc("person3").result).toMatchObject({ ...person3, name: { ...person3.name, first: "NEW" } });
	// Add new documents (with random IDs).
	const addedBasicId = queryBasics.add(basic9);
	expect(typeof addedBasicId).toBe("string");
	const addedPersonId = queryPeople.add(person5);
	expect(typeof addedPersonId).toBe("string");
	// Delete documents.
	expect(queryBasics.doc("basic2").delete()).toBe(undefined);
	expect(queryBasics.count).toBe(3);
	expect(queryPeople.doc("personNone").delete()).toBe(undefined);
	expect(queryPeople.doc("person3").delete()).toBe(undefined);
	expect(queryPeople.doc("personNone").delete()).toBe(undefined);
	expect(queryPeople.count).toBe(3);
});
test("MemoryProvider: set/get/delete collections", () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const basicsQuery = db.query("basics");
	const peopleQuery = db.query("people");
	// Change collections.
	for (const { id, ...data } of basics) basicsQuery.doc(id).set(data);
	for (const { id, ...data } of people) peopleQuery.doc(id).set(data);
	// Check collections.
	expect(basicsQuery.value).toEqual(basics);
	expect(basicsQuery.doc("basic1").value).toMatchObject(basic1);
	expect(basicsQuery.doc("basic6").value).toMatchObject(basic6);
	expect(basicsQuery.doc("basicNone").value).toBe(null);
	expect(peopleQuery.value).toEqual(people);
	expect(peopleQuery.doc("person4").value).toMatchObject(person4);
	expect(peopleQuery.doc("peopleNone").value).toBe(null);
	// Delete collections.
	expect(basicsQuery.delete()).toBe(9);
	expect(peopleQuery.delete()).toBe(5);
	// Check collections.
	expect(peopleQuery.value).toEqual([]);
	expect(basicsQuery.value).toEqual([]);
});
test("MemoryProvider: get queries", async () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const query = db.query("basics");
	for (const { id, ...data } of basics) query.doc(id).set(data);
	// Equal queries.
	expectUnorderedKeys(await query.filter({ str: "aaa" }).value, ["basic1"]);
	expectUnorderedKeys(await query.filter({ str: "NOPE" }).value, []);
	expectUnorderedKeys(await query.filter({ num: 300 }).value, ["basic3"]);
	expectUnorderedKeys(await query.filter({ num: 999999 }).value, []);
	expectUnorderedKeys(await query.filter({ group: "a" }).value, ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(await query.filter({ group: "b" }).value, ["basic4", "basic5", "basic6"]);
	expectUnorderedKeys(await query.filter({ group: "c" }).value, ["basic7", "basic8", "basic9"]);
	// ArrayContains queries.
	expectUnorderedKeys(await query.filter({ "tags[]": "odd" }).value, ["basic1", "basic3", "basic5", "basic7", "basic9"]);
	expectUnorderedKeys(await query.filter({ "tags[]": "even" }).value, ["basic2", "basic4", "basic6", "basic8"]);
	expectUnorderedKeys(await query.filter({ "tags[]": "prime" }).value, ["basic1", "basic2", "basic3", "basic5", "basic7"]);
	expectUnorderedKeys(await query.filter({ "tags[]": "NOPE" }).value, []);
	// In queries.
	expectUnorderedKeys(await query.filter({ num: [200, 600, 900, 999999] }).value, ["basic2", "basic6", "basic9"]);
	expectUnorderedKeys(await query.filter({ str: ["aaa", "ddd", "eee", "NOPE"] }).value, ["basic1", "basic4", "basic5"]);
	expectUnorderedKeys(await query.filter({ num: [] }).value, []);
	expectUnorderedKeys(await query.filter({ str: [] }).value, []);
	// Sorting.
	const keysAsc = ["basic1", "basic2", "basic3", "basic4", "basic5", "basic6", "basic7", "basic8", "basic9"];
	const keysDesc = ["basic9", "basic8", "basic7", "basic6", "basic5", "basic4", "basic3", "basic2", "basic1"];
	expectOrderedKeys(await query.sort("id").value, keysAsc);
	expectOrderedKeys(await query.sort("!id").value, keysDesc);
	expectOrderedKeys(await query.sort("str").value, keysAsc);
	expectOrderedKeys(await query.sort("!str").value, keysDesc);
	expectOrderedKeys(await query.sort("num").value, keysAsc);
	expectOrderedKeys(await query.sort("!num").value, keysDesc);
	// Combinations.
	expectOrderedKeys(await query.sort("id").max(2).value, ["basic1", "basic2"]);
	expectOrderedKeys(await query.sort("!id").max(1).value, ["basic9"]);
	expectOrderedKeys(await query.filter({ "tags[]": "prime" }).sort("!id").max(2).value, ["basic7", "basic5"]);
});
test("MemoryProvider: subscribing to documents", async () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const query = db.query("basics");
	const doc = query.doc("basic1");
	// Subscribe.
	const calls1: OptionalData<BasicEntity>[] = [];
	const un1 = doc.subscribe(v => calls1.push(v));
	await Promise.resolve();
	expect(calls1.length).toBe(1);
	expect(calls1[0]).toBe(null);
	// Set.
	doc.set(basic1);
	await Promise.resolve();
	expect(calls1.length).toBe(2);
	expect(calls1[1]).toMatchObject(basic1);
	// Update.
	doc.update({ str: "NEW" });
	await Promise.resolve();
	expect(calls1.length).toBe(3);
	expect(calls1[2]).toMatchObject({ ...basic1, str: "NEW" });
	// Delete.
	doc.delete();
	await Promise.resolve();
	expect(calls1[3]).toBe(null);
	// Change unrelated documents.
	query.doc("basic2").set(basic2);
	query.doc("basic2").update({ str: "NEW" });
	query.doc("basic2").delete();
	query.add(basic3);
	expect(calls1.length).toBe(4);
	// Unsubscribe.
	expect(un1()).toBe(undefined);
	// Set.
	doc.set(basic1);
	expect(calls1.length).toBe(4);
});
test("MemoryProvider: subscribing to collections", async () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const query = db.query("basics");
	// Subscribe fn1.
	const calls1: ImmutableArray<BasicEntity>[] = [];
	const stop1 = query.subscribe(results => void calls1.push(results));
	await Promise.resolve();
	expect(calls1.length).toBe(1);
	expectOrderedKeys(calls1[0]!, []); // Empty at first (no last argument).
	// Add id1.
	const id1 = await query.add(basic1);
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
	const calls2: ImmutableArray<BasicEntity>[] = [];
	const stop2 = query.subscribe(results => void calls2.push(results));
	await Promise.resolve();
	expectOrderedKeys(calls2[0]!, [id1]); // Called with current results.
	expect(calls1[2]).toBe(undefined);
	// Set basic2.
	query.doc("basic2").set(basic2);
	await Promise.resolve();
	expectOrderedKeys(calls1[2]!, [id1, "basic2"]);
	expectOrderedKeys(calls2[1]!, [id1, "basic2"]);
	// Change id1.
	query.doc(id1).set(basic9);
	await Promise.resolve();
	expectOrderedKeys(calls1[3]!, [id1, "basic2"]);
	expectOrderedKeys(calls2[2]!, [id1, "basic2"]);
	// Add basic3 and basic4
	query.doc("basic3").set(basic3);
	query.doc("basic4").set(basic4);
	await Promise.resolve();
	expectOrderedKeys(calls1[5]!, [id1, "basic2", "basic3", "basic4"]);
	expectOrderedKeys(calls2[4]!, [id1, "basic2", "basic3", "basic4"]);
	// Delete basic4.
	query.doc("basic4").delete();
	await Promise.resolve();
	expectOrderedKeys(calls1[6]!, [id1, "basic2", "basic3"]);
	expectOrderedKeys(calls2[5]!, [id1, "basic2", "basic3"]);
	// Unsubscribe fn2.
	expect(stop2()).toBe(undefined);
	// Change basic3.
	query.doc("basic3").update({ str: "NEW" });
	await Promise.resolve();
	expectOrderedKeys(calls1[7]!, [id1, "basic2", "basic3"]);
	expect(calls2[6]).toBe(undefined);
	// Unsubscribe fn1.
	expect(stop1()).toBe(undefined);
});
test("MemoryProvider: subscribing to filter query", async () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const query = db.query("basics");
	query.doc("basic6").set(basic6);
	query.doc("basic7").set(basic7);
	// Subscribe (should find only basic7).
	const calls1: ImmutableArray<BasicEntity>[] = [];
	const stop1 = query.filter({ "tags[]": "odd" }).subscribe(results => void calls1.push(results)); // Query for odds.
	await Promise.resolve();
	expectUnorderedKeys(calls1[0]!, ["basic7"]);
	// Set basic3 (should be added to result).
	query.doc("basic3").set(basic3);
	await Promise.resolve();
	expectUnorderedKeys(calls1[1]!, ["basic3", "basic7"]);
	// Set basic2 (shouldn't call fn1).
	query.doc("basic2").set(basic2);
	await Promise.resolve();
	expect(calls1[3]).toBe(undefined);
	// Change basic2 and basic3 (should have updated basic3 in result).
	query.filter({ id: ["basic2", "basic3"] }).update({ str: "NEW" });
	await Promise.resolve();
	expectUnorderedKeys(calls1[2]!, ["basic3", "basic7"]);
	// Delete basic3 and basic2.
	query.doc("basic2").delete();
	query.doc("basic3").delete();
	await Promise.resolve();
	expectUnorderedKeys(calls1[3]!, ["basic7"]);
	// Unsubscribe fn1.
	expect(stop1()).toBe(undefined);
	// Check end result.
	expectUnorderedKeys(await query.value, ["basic6", "basic7"]);
});
test("MemoryProvider: subscribing to sort and limit query", async () => {
	// Setup.
	const db = new Database(TEST_SCHEMAS, new MemoryProvider());
	const query = db.query("basics");
	for (const { id, ...data } of basics) query.doc(id).set(data);
	// Subscribe (should find only basic7).
	const calls1: ImmutableArray<BasicEntity>[] = [];
	const stop1 = query
		.sort("num")
		.max(2)
		.subscribe(result => void calls1.push(result));
	await Promise.resolve();
	expectOrderedKeys(calls1[0]!, ["basic1", "basic2"]);
	// Delete basic9 (shouldn't affect result as it's outside the slice).
	query.doc("basic9").delete();
	await Promise.resolve();
	expect(calls1[1]).toBe(undefined);
	// Delete basic1 (should be removed from result, which brings in basic3).
	query.doc("basic1").delete();
	await Promise.resolve();
	expectOrderedKeys(calls1[1]!, ["basic2", "basic3"]);
	// Change basic2 and basic3 (should have updated basic3 in result).
	query.doc("basic2").update({ str: "NEW" });
	query.doc("basic8").update({ str: "NEW" });
	await Promise.resolve();
	expectOrderedKeys(calls1[2]!, ["basic2", "basic3"]);
	// Add a new one at the start.
	const id1 = await query.add({ str: "NEW", num: 0, group: "a", tags: [] });
	await Promise.resolve();
	expectOrderedKeys(calls1[3]!, [id1, "basic2"]);
	// Delete everything.
	query.delete();
	await Promise.resolve();
	expectOrderedKeys(calls1[4]!, []);
	// Set basic8.
	query.doc("basic8").set(basic8);
	await Promise.resolve();
	expectOrderedKeys(calls1[5]!, ["basic8"]);
	// Unsubscribe fn1.
	expect(stop1()).toBe(undefined);
	// Delete basic8 (shouldn't call fn1).
	query.doc("basic8").delete();
	await Promise.resolve();
	expect(calls1[6]).toBe(undefined);
	// Check end result.
	expectUnorderedKeys(await query.value, []);
});
