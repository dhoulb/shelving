import {
	basics,
	people,
	basic1,
	basic2,
	basic3,
	basic4,
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
	BasicItemData,
	TestCollections,
	basic999,
} from "../test/index.js";
import { MemoryProvider, OptionalData, ImmutableArray, Database, runMicrotasks } from "../index.js";

test("MemoryProvider: set/get/delete documents", () => {
	// Setup.
	const db = new Database<TestCollections>(new MemoryProvider<TestCollections>());
	const collectionBasics = db.collection("basics");
	const queryBasics = collectionBasics.query();
	const collectionPeople = db.collection("people");
	const queryPeople = collectionPeople.query();

	// Add documents.
	expect(collectionBasics.item("basic1").set(basic1)).toBe(undefined);
	expect(collectionBasics.item("basic2").set(basic2)).toBe(undefined);
	expect(collectionBasics.item("basic3").set(basic3)).toBe(undefined);
	expect(collectionPeople.item("person1").set(person1)).toBe(undefined);
	expect(collectionPeople.item("person2").set(person2)).toBe(undefined);
	expect(collectionPeople.item("person3").set(person3)).toBe(undefined);
	// Check documents.
	expect(collectionBasics.item("basic1").value).toMatchObject(basic1);
	expect(collectionBasics.item("basic2").value).toMatchObject(basic2);
	expect(collectionBasics.item("basic3").value).toMatchObject(basic3);
	expect(collectionBasics.item("basicNone").value).toBe(null);
	expect(queryBasics.count).toBe(3);
	expect(collectionPeople.item("person1").value).toMatchObject(person1);
	expect(collectionPeople.item("person2").value).toMatchObject(person2);
	expect(collectionPeople.item("person3").value).toMatchObject(person3);
	expect(collectionPeople.item("peopleNone").value).toBe(null);
	expect(queryPeople.count).toBe(3);
	// Update documents.
	expect(collectionBasics.item("basic1").update({ str: "NEW" })).toBe(undefined);
	expect(collectionBasics.item("basic1").value).toMatchObject({ ...basic1, str: "NEW" });
	// collectionpeople.item("person3").merge({ name: { first: "NEW" } })).toBe(undefined);
	// Merge documents.
	// collectionpeople.item("person3").result).toMatchObject({ ...person3, name: { ...person3.name, first: "NEW" } });
	// Add new documents (with random IDs).
	const addedBasicId = collectionBasics.add(basic9);
	expect(typeof addedBasicId).toBe("string");
	const addedPersonId = collectionPeople.add(person5);
	expect(typeof addedPersonId).toBe("string");
	// Delete documents.
	expect(collectionBasics.item("basic2").delete()).toBe(undefined);
	expect(queryBasics.count).toBe(3);
	expect(collectionPeople.item("personNone").delete()).toBe(undefined);
	expect(collectionPeople.item("person3").delete()).toBe(undefined);
	expect(collectionPeople.item("personNone").delete()).toBe(undefined);
	expect(queryPeople.count).toBe(3);
});
test("MemoryProvider: set/get/delete collections", () => {
	// Setup.
	const db = new Database<TestCollections>(new MemoryProvider<TestCollections>());
	const basicsCollection = db.collection("basics");
	const basicsQuery = basicsCollection.query();
	const peopleCollection = db.collection("people");
	const peopleQuery = peopleCollection.query();
	// Change collections.
	for (const { id, ...data } of basics) basicsCollection.item(id).set(data);
	for (const { id, ...data } of people) peopleCollection.item(id).set(data);
	// Check collections.
	expect(basicsQuery.value).toEqual(basics);
	expect(basicsCollection.item("basic1").value).toMatchObject(basic1);
	expect(basicsCollection.item("basic6").value).toMatchObject(basic6);
	expect(basicsCollection.item("basicNone").value).toBe(null);
	expect(peopleQuery.value).toEqual(people);
	expect(peopleCollection.item("person4").value).toMatchObject(person4);
	expect(peopleCollection.item("peopleNone").value).toBe(null);
	// Delete collections.
	expect(basicsQuery.delete()).toBe(9);
	expect(peopleQuery.delete()).toBe(5);
	// Check collections.
	expect(peopleQuery.value).toEqual([]);
	expect(basicsQuery.value).toEqual([]);
});
test("MemoryProvider: get queries", () => {
	// Setup.
	const db = new Database<TestCollections>(new MemoryProvider<TestCollections>());
	const collection = db.collection("basics");
	const query = collection.query();
	for (const { id, ...data } of basics) collection.item(id).set(data);
	// Equal queries.
	expectUnorderedKeys(query.filter({ str: "aaa" }).value, ["basic1"]);
	expectUnorderedKeys(query.filter({ str: "NOPE" }).value, []);
	expectUnorderedKeys(query.filter({ num: 300 }).value, ["basic3"]);
	expectUnorderedKeys(query.filter({ num: 999999 }).value, []);
	expectUnorderedKeys(query.filter({ group: "a" }).value, ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(query.filter({ group: "b" }).value, ["basic4", "basic5", "basic6"]);
	expectUnorderedKeys(query.filter({ group: "c" }).value, ["basic7", "basic8", "basic9"]);
	// ArrayContains queries.
	expectUnorderedKeys(query.filter({ "tags[]": "odd" }).value, ["basic1", "basic3", "basic5", "basic7", "basic9"]);
	expectUnorderedKeys(query.filter({ "tags[]": "even" }).value, ["basic2", "basic4", "basic6", "basic8"]);
	expectUnorderedKeys(query.filter({ "tags[]": "prime" }).value, ["basic1", "basic2", "basic3", "basic5", "basic7"]);
	expectUnorderedKeys(query.filter({ "tags[]": "NOPE" }).value, []);
	// In queries.
	expectUnorderedKeys(query.filter({ num: [200, 600, 900, 999999] }).value, ["basic2", "basic6", "basic9"]);
	expectUnorderedKeys(query.filter({ str: ["aaa", "ddd", "eee", "NOPE"] }).value, ["basic1", "basic4", "basic5"]);
	expectUnorderedKeys(query.filter({ num: [] }).value, []);
	expectUnorderedKeys(query.filter({ str: [] }).value, []);
	// Sorting.
	const keysAsc = ["basic1", "basic2", "basic3", "basic4", "basic5", "basic6", "basic7", "basic8", "basic9"];
	const keysDesc = ["basic9", "basic8", "basic7", "basic6", "basic5", "basic4", "basic3", "basic2", "basic1"];
	expectOrderedKeys(query.sort("id").value, keysAsc);
	expectOrderedKeys(query.sort("!id").value, keysDesc);
	expectOrderedKeys(query.sort("str").value, keysAsc);
	expectOrderedKeys(query.sort("!str").value, keysDesc);
	expectOrderedKeys(query.sort("num").value, keysAsc);
	expectOrderedKeys(query.sort("!num").value, keysDesc);
	// Combinations.
	expectOrderedKeys(query.sort("id").max(2).value, ["basic1", "basic2"]);
	expectOrderedKeys(query.sort("!id").max(1).value, ["basic9"]);
	expectOrderedKeys(query.filter({ "tags[]": "prime" }).sort("!id").max(2).value, ["basic7", "basic5"]);
});
test("MemoryProvider: subscribing to documents", async () => {
	// Setup.
	const db = new Database<TestCollections>(new MemoryProvider<TestCollections>());
	const collection = db.collection("basics");
	const query = collection.query();
	const doc = collection.item("basic1");
	// Subscribe.
	const calls1: OptionalData<BasicItemData>[] = [];
	const un1 = doc.subscribe(v => calls1.push(v));
	await runMicrotasks();
	expect(calls1.length).toBe(1);
	expect(calls1[0]).toBe(null);
	// Set.
	doc.set(basic1);
	await runMicrotasks();
	expect(calls1.length).toBe(2);
	expect(calls1[1]).toMatchObject(basic1);
	// Update.
	doc.update({ str: "NEW" });
	await runMicrotasks();
	expect(calls1.length).toBe(3);
	expect(calls1[2]).toMatchObject({ ...basic1, str: "NEW" });
	// Delete.
	doc.delete();
	await runMicrotasks();
	expect(calls1[3]).toBe(null);
	// Change unrelated documents.
	collection.item("basic2").set(basic2);
	collection.item("basic2").update({ str: "NEW" });
	collection.item("basic2").delete();
	collection.add(basic3);
	await runMicrotasks();
	expect(calls1.length).toBe(4);
	// Unsubscribe.
	expect(un1()).toBe(undefined);
	// Set.
	doc.set(basic1);
	await runMicrotasks();
	expect(calls1.length).toBe(4);
});
test("MemoryProvider: subscribing to collections", async () => {
	// Setup.
	const db = new Database<TestCollections>(new MemoryProvider<TestCollections>());
	const collection = db.collection("basics");
	const query = collection.query();
	// Subscribe fn1.
	const calls1: ImmutableArray<BasicItemData>[] = [];
	const stop1 = query.subscribe(results => void calls1.push(results));
	await runMicrotasks();
	expect(calls1.length).toBe(1);
	expectOrderedKeys(calls1[0]!, []); // Empty at first (no last argument).
	// Add id1.
	const id1 = collection.add(basic1);
	await runMicrotasks();
	expect(calls1.length).toBe(2);
	expectOrderedKeys(calls1[1]!, [id1]); // id1 is added.
	// Subscribe fn2.
	const calls2: ImmutableArray<BasicItemData>[] = [];
	const stop2 = query.subscribe(results => void calls2.push(results));
	await runMicrotasks();
	expectOrderedKeys(calls2[0]!, [id1]); // Called with current results.
	expect(calls1[2]).toBe(undefined);
	// Set basic2.
	collection.item("basic2").set(basic2);
	await runMicrotasks();
	expectOrderedKeys(calls1[2]!, [id1, "basic2"]);
	expectOrderedKeys(calls2[1]!, [id1, "basic2"]);
	// Change id1.
	collection.item(id1).set(basic9);
	await runMicrotasks();
	expectOrderedKeys(calls1[3]!, [id1, "basic2"]);
	expectOrderedKeys(calls2[2]!, [id1, "basic2"]);
	// Add basic3 and basic4
	collection.item("basic3").set(basic3);
	collection.item("basic4").set(basic4);
	await runMicrotasks();
	expectOrderedKeys(calls1[4]!, [id1, "basic2", "basic3", "basic4"]);
	expectOrderedKeys(calls2[3]!, [id1, "basic2", "basic3", "basic4"]);
	// Delete basic4.
	collection.item("basic4").delete();
	await runMicrotasks();
	expectOrderedKeys(calls1[5]!, [id1, "basic2", "basic3"]);
	expectOrderedKeys(calls2[4]!, [id1, "basic2", "basic3"]);
	// Unsubscribe fn2.
	expect(stop2()).toBe(undefined);
	// Change basic3.
	collection.item("basic3").update({ str: "NEW" });
	await runMicrotasks();
	expectOrderedKeys(calls1[6]!, [id1, "basic2", "basic3"]);
	expect(calls2[6]).toBe(undefined);
	// Unsubscribe fn1.
	expect(stop1()).toBe(undefined);
});
test("MemoryProvider: subscribing to filter query", async () => {
	// Setup.
	const db = new Database<TestCollections>(new MemoryProvider<TestCollections>());
	const collection = db.collection("basics");
	const query = collection.query();
	collection.item("basic6").set(basic6);
	collection.item("basic7").set(basic7);
	// Subscribe (should find only basic7).
	const calls1: ImmutableArray<BasicItemData>[] = [];
	const stop1 = query.filter({ "tags[]": "odd" }).subscribe(results => void calls1.push(results)); // Query for odds.
	await runMicrotasks();
	expectUnorderedKeys(calls1[0]!, ["basic7"]);
	// Set basic3 (should be added to result).
	collection.item("basic3").set(basic3);
	await runMicrotasks();
	expectUnorderedKeys(calls1[1]!, ["basic3", "basic7"]);
	// Set basic2 (shouldn't call fn1).
	collection.item("basic2").set(basic2);
	await runMicrotasks();
	expect(calls1[3]).toBe(undefined);
	// Change basic2 and basic3 (should have updated basic3 in result).
	query.filter({ id: ["basic2", "basic3"] }).update({ str: "NEW" });
	await runMicrotasks();
	expectUnorderedKeys(calls1[2]!, ["basic3", "basic7"]);
	// Delete basic3 and basic2.
	collection.item("basic2").delete();
	collection.item("basic3").delete();
	await runMicrotasks();
	expectUnorderedKeys(calls1[3]!, ["basic7"]);
	// Unsubscribe fn1.
	await runMicrotasks();
	expect(stop1()).toBe(undefined);
	// Check end result.
	await runMicrotasks();
	expectUnorderedKeys(query.value, ["basic6", "basic7"]);
});
test("MemoryProvider: subscribing to sort and limit query", async () => {
	// Setup.
	const db = new Database<TestCollections>(new MemoryProvider<TestCollections>());
	const collection = db.collection("basics");
	const query = collection.query();
	for (const { id, ...data } of basics) collection.item(id).set(data);
	// Subscribe (should find only basic7).
	const calls1: ImmutableArray<BasicItemData>[] = [];
	const stop1 = query
		.sort("num")
		.max(2)
		.subscribe(result => void calls1.push(result));
	await runMicrotasks();
	expectOrderedKeys(calls1[0]!, ["basic1", "basic2"]);
	// Delete basic9 (shouldn't affect result as it's outside the slice).
	collection.item("basic9").delete();
	await runMicrotasks();
	expect(calls1[1]).toBe(undefined);
	// Delete basic1 (should be removed from result, which brings in basic3).
	collection.item("basic1").delete();
	await runMicrotasks();
	expectOrderedKeys(calls1[1]!, ["basic2", "basic3"]);
	// Change basic2 and basic3 (should have updated basic3 in result).
	collection.item("basic2").update({ str: "NEW" });
	collection.item("basic8").update({ str: "NEW" });
	await runMicrotasks();
	expectOrderedKeys(calls1[2]!, ["basic2", "basic3"]);
	// Add a new one at the start.
	const id1 = collection.add({ ...basic999, num: 0 });
	await runMicrotasks();
	expectOrderedKeys(calls1[3]!, [id1, "basic2"]);
	// Delete everything.
	query.delete();
	await runMicrotasks();
	expectOrderedKeys(calls1[4]!, []);
	// Set basic8.
	collection.item("basic8").set(basic8);
	await runMicrotasks();
	expectOrderedKeys(calls1[5]!, ["basic8"]);
	// Unsubscribe fn1.
	await runMicrotasks();
	expect(stop1()).toBe(undefined);
	// Delete basic8 (shouldn't call fn1).
	collection.item("basic8").delete();
	await runMicrotasks();
	expect(calls1[6]).toBe(undefined);
	// Check end result.
	await runMicrotasks();
	expectUnorderedKeys(query.value, []);
});
