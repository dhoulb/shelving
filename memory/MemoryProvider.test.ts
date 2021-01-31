import { createTestDatabase, allBasics, allPeople, deleteBasics, deletePeople } from "shelving/test";
import { provideMemory } from ".";

const { basic1, basic2, basic3, basic4, basic5, basic6, basic7, basic8, basic9 } = allBasics;
const { person1, person2, person3, person4, person5 } = allPeople;

test("MemoryProvider: set/get/delete documents", async () => {
	// Setup.
	const provider = provideMemory();
	const db = createTestDatabase(provider);
	const basics = db.collection("basics");
	const people = db.collection("people");





	// Add documents.
	expect(() => basics.doc("basic1").set(basic1)).not.toThrow();
	expect(() => basics.doc("basic2").set(basic2)).not.toThrow();
	expect(() => basics.doc("basic3").set(basic3)).not.toThrow();
	expect(() => people.doc("person1").set(person1)).not.toThrow();
	expect(() => people.doc("person2").set(person2)).not.toThrow();
	expect(() => people.doc("person3").set(person3)).not.toThrow();
	// Check documents.
	expect(await basics.doc("basic1").result).toBe(basic1);
	expect(await basics.doc("basic2").result).toBe(basic2);
	expect(await basics.doc("basic3").result).toBe(basic3);
	expect(await basics.doc("basicNone").result).toBe(undefined);
	expect(await basics.count).toBe(3);
	expect(await people.doc("person1").result).toBe(person1);
	expect(await people.doc("person2").result).toBe(person2);
	expect(await people.doc("person3").result).toBe(person3);
	expect(await people.doc("peopleNone").result).toBe(undefined);
	expect(await people.count).toBe(3);
	// Merge documents.
	expect(await basics.doc("basic1").merge({ str: "NEW" })).toMatchObject({ str: "NEW" });
	expect(await basics.doc("basic1").result).toMatchObject({ ...basic1, str: "NEW" });
	expect(await people.doc("person3").merge({ name: { first: "NEW" } })).toMatchObject({ name: { first: "NEW" } });
	expect(await people.doc("person3").result).toMatchObject({ ...person3, name: { ...person3.name, first: "NEW" } });
	// Add new documents (with random IDs).
	const [addedBasicId, addedBasicValue] = await basics.add(basic9);
	expect(typeof addedBasicId).toBe("string");
	expect(addedBasicValue).toBe(basic9);
	const [addedPersonId, addedPersonValue] = await people.add(person5);
	expect(typeof addedPersonId).toBe("string");
	expect(addedPersonValue).toBe(person5);
	// Delete documents.
	expect(await basics.doc("basic2").delete()).toBe(undefined);
	expect(await basics.count).toBe(3);
	expect(await people.doc("personNone").delete()).toBe(undefined);
	expect(await people.doc("person3").delete()).toBe(undefined);
	expect(await people.doc("personNone").delete()).toBe(undefined);
	expect(await people.count).toBe(3);
});
test("MemoryProvider: set/get/delete collections", async () => {
	// Setup.
	const provider = provideMemory();
	const db = createTestDatabase(provider);
	const basics = db.collection("basics");
	const people = db.collection("people");
	// Change collections.
	await basics.change(allBasics);
	await people.change(allPeople);
	// Check collections.
	expect(await basics.results).toEqual(allBasics);
	expect(await basics.doc("basic1").result).toEqual(basic1);
	expect(await basics.doc("basic6").result).toEqual(basic6);
	expect(await basics.doc("basicNone").result).toBe(undefined);
	expect(await people.results).toEqual(allPeople);
	expect(await people.doc("person4").result).toEqual(person4);
	expect(await people.doc("peopleNone").result).toBe(undefined);
	// Delete collections.
	expect(await basics.deleteAll()).toEqual(deleteBasics);
	expect(await people.deleteAll()).toEqual(deletePeople);
	// Check collections.
	expect(await people.results).toEqual({});
	expect(await basics.results).toEqual({});
});
test("MemoryProvider: get queries", async () => {
	// Setup.
	const provider = provideMemory();
	const db = createTestDatabase(provider);
	const collection = db.collection("basics");
	await collection.change(allBasics);
	// Equal queries.
	expect(await collection.is("str", "aaa").results).toEqual({ basic1 });
	expect(await collection.is("str", "NOPE").results).toEqual({});
	expect(await collection.is("num", 300).results).toEqual({ basic3 });
	expect(await collection.is("num", 999999).results).toEqual({});
	expect(await collection.is("group", "a").results).toEqual({ basic1, basic2, basic3 });
	expect(await collection.is("group", "b").results).toEqual({ basic4, basic5, basic6 });
	expect(await collection.is("group", "c").results).toEqual({ basic7, basic8, basic9 });
	// ArrayContains queries.
	expect(await collection.contains("tags", "odd").results).toEqual({ basic1, basic3, basic5, basic7, basic9 });
	expect(await collection.contains("tags", "even").results).toEqual({ basic2, basic4, basic6, basic8 });
	expect(await collection.contains("tags", "prime").results).toEqual({ basic1, basic2, basic3, basic5, basic7 });
	expect(await collection.contains("tags", "NOPE").results).toEqual({});
	// In queries.
	expect(await collection.in("num", [200, 600, 900, 999999]).results).toEqual({ basic2, basic6, basic9 });
	expect(await collection.in("str", ["aaa", "ddd", "eee", "NOPE"]).results).toEqual({ basic1, basic4, basic5 });
	expect(await collection.in("num", []).results).toEqual({});
	expect(await collection.in("str", []).results).toEqual({});
	// Sorting.
	expect(Object.keys(await collection.asc().results)).toEqual(Object.keys(allBasics).sort());
	expect(Object.keys(await collection.desc().results)).toEqual(Object.keys(allBasics).sort().reverse());
	expect(Object.keys(await collection.asc("str").results)).toEqual(Object.keys(allBasics).sort());
	expect(Object.keys(await collection.desc("str").results)).toEqual(Object.keys(allBasics).sort().reverse());
	expect(Object.keys(await collection.asc("num").results)).toEqual(Object.keys(allBasics).sort());
	expect(Object.keys(await collection.desc("num").results)).toEqual(Object.keys(allBasics).sort().reverse());
	// Limiting.
	expect(await collection.asc().limit(2).results).toEqual({ basic1, basic2 });
	// Combinations.
	expect(await collection.asc("id").limit(2).results).toEqual({ basic1, basic2 });
	expect(await collection.desc("id").limit(1).results).toEqual({ basic9 });
	expect(Object.keys(await collection.contains("tags", "prime").desc("id").limit(2).results)).toEqual(["basic7", "basic5"]);
});
test("MemoryProvider: subscribing to documents", async () => {
	// Setup.
	const provider = provideMemory();
	const db = createTestDatabase(provider);
	const collection = db.collection("basics");
	const doc = collection.doc("basic1");
	// Subscribe.
	const fn1 = jest.fn();
	const un1 = doc.on(fn1);
	await Promise.resolve();
	expect(fn1).nthCalledWith(1, undefined);
	// Set.
	await doc.set(basic1);
	await Promise.resolve();
	expect(fn1).nthCalledWith(2, basic1);
	// Merge.
	await doc.merge({ str: "NEW" });
	await Promise.resolve();
	expect(fn1).nthCalledWith(3, expect.objectContaining({ ...basic1, str: "NEW" }));
	// Delete.
	await doc.delete();
	await Promise.resolve();
	expect(fn1).nthCalledWith(4, undefined);
	// Change unrelated documents.
	expect(fn1).toBeCalledTimes(4);
	await collection.doc("basic2").set(basic2);
	await collection.doc("basic2").merge({ str: "NEW" });
	await collection.doc("basic2").delete();
	await collection.add(basic3);
	expect(fn1).toBeCalledTimes(4);
	// Unsubscribe.
	expect(un1()).toBe(undefined);
	// Set.
	await doc.set(basic1);
	expect(fn1).toBeCalledTimes(4);
});
test("MemoryProvider: subscribing to collections", async () => {
	// Setup.
	const provider = provideMemory();
	const db = createTestDatabase(provider);
	const collection = db.collection("basics");
	// Subscribe.
	const fn1 = jest.fn();
	const un1 = collection.on(fn1);
	await Promise.resolve();
	expect(fn1).nthCalledWith(1, {}); // Empty at first (no last argument).
	// Add id1.
	const [id1] = await collection.add(basic1);
	await Promise.resolve();
	expect(fn1).nthCalledWith(2, { [id1]: basic1 }); // id1 is added.
	// Subscribe.
	const fn2 = jest.fn();
	const un2 = collection.on(fn2);
	await Promise.resolve();
	expect(fn2).nthCalledWith(1, { [id1]: basic1 });
	// Set basic2.
	await collection.doc("basic2").set(basic2);
	await Promise.resolve();
	expect(fn1).nthCalledWith(3, { [id1]: basic1, basic2 });
	expect(fn2).nthCalledWith(2, { [id1]: basic1, basic2 });
	// Change id1 and add basic3 and basic4.
	await collection.change({ [id1]: { str: "NEW" }, basic3, basic4 });
	await Promise.resolve();
	expect(fn1).nthCalledWith(4, {
		[id1]: expect.objectContaining({ ...basic1, str: "NEW" }),
		basic2: expect.objectContaining(basic2),
		basic3: expect.objectContaining(basic3),
		basic4: expect.objectContaining(basic4),
	});
	expect(fn2).nthCalledWith(3, {
		[id1]: expect.objectContaining({ ...basic1, str: "NEW" }),
		basic2: expect.objectContaining(basic2),
		basic3: expect.objectContaining(basic3),
		basic4: expect.objectContaining(basic4),
	});
	// Delete basic4.
	await collection.change({ basic4: undefined });
	await Promise.resolve();
	expect(fn1).nthCalledWith(5, {
		[id1]: expect.objectContaining({ ...basic1, str: "NEW" }),
		basic2: expect.objectContaining(basic2),
		basic3: expect.objectContaining(basic3),
	});
	expect(fn2).nthCalledWith(4, {
		[id1]: expect.objectContaining({ ...basic1, str: "NEW" }),
		basic2: expect.objectContaining(basic2),
		basic3: expect.objectContaining(basic3),
	});
	// Unsubscribe fn2.
	expect(un2()).toBe(undefined);
	// Change basic3.
	await collection.doc("basic3").merge({ str: "NEW" });
	await Promise.resolve();
	expect(fn1).nthCalledWith(6, {
		[id1]: expect.objectContaining({ ...basic1, str: "NEW" }),
		basic2: expect.objectContaining(basic2),
		basic3: expect.objectContaining({ ...basic3, str: "NEW" }),
	});
	expect(fn2).toBeCalledTimes(4); // Not called again.
	// Unsubscribe fn1.
	expect(un1()).toBe(undefined);
});
test("MemoryProvider: subscribing to filter query", async () => {
	// Setup.
	const provider = provideMemory();
	const db = createTestDatabase(provider);
	const collection = db.collection("basics");
	await collection.doc("basic6").set(basic6);
	await collection.doc("basic7").set(basic7);
	// Subscribe (should find only basic7).
	const fn1 = jest.fn();
	const un1 = collection.contains("tags", "odd").on(fn1); // Query for odds.
	await Promise.resolve();
	expect(fn1).nthCalledWith(1, {
		basic7: expect.objectContaining(basic7),
	});
	// Set basic3 (should be added to result).
	await collection.doc("basic3").set(basic3);
	await Promise.resolve();
	expect(fn1).nthCalledWith(2, {
		basic3: expect.objectContaining(basic3),
		basic7: expect.objectContaining(basic7),
	});
	// Set basic2 (shouldn't call fn1).
	await collection.doc("basic2").set(basic2);
	await Promise.resolve();
	expect(fn1).toBeCalledTimes(2);
	// Change basic2 and basic3 (should have updated basic3 in result).
	await collection.change({ basic2: { str: "NEW" }, basic3: { str: "NEW" } });
	await Promise.resolve();
	expect(fn1).nthCalledWith(3, {
		basic3: expect.objectContaining({ ...basic3, str: "NEW" }),
		basic7: expect.objectContaining(basic7),
	});
	// Delete basic3 and basic2.
	await collection.change({ basic3: undefined, basic2: undefined });
	await Promise.resolve();
	expect(fn1).nthCalledWith(4, {
		basic7: expect.objectContaining(basic7),
	});
	// Unsubscribe fn1.
	expect(un1()).toBe(undefined);
	// Check end result.
	expect(await collection.results).toMatchObject({ basic6, basic7 });
});
test("MemoryProvider: subscribing to limit query", async () => {
	// Setup.
	const provider = provideMemory();
	const db = createTestDatabase(provider);
	const collection = db.collection("basics");
	await collection.change(allBasics);
	// Subscribe (should find only basic7).
	const fn1 = jest.fn();
	const un1 = collection.asc("id").limit(2).on(fn1); // Query for odds.
	await Promise.resolve();
	expect(fn1).nthCalledWith(1, {
		basic1: expect.objectContaining(basic1),
		basic2: expect.objectContaining(basic2),
	});
	// Delete basic9 (shouldn't affect result as it's outside the slice).
	await collection.doc("basic9").delete();
	await Promise.resolve();
	expect(fn1).toBeCalledTimes(1);
	// Delete basic1 (should be removed from result, which brings in basic3).
	await collection.doc("basic1").delete();
	await Promise.resolve();
	expect(fn1).nthCalledWith(2, {
		basic2: expect.objectContaining(basic2),
		basic3: expect.objectContaining(basic3),
	});
	// Change basic2 and basic3 (should have updated basic3 in result).
	await collection.change({ basic2: { str: "NEW" }, basic8: { str: "NEW" } });
	await Promise.resolve();
	expect(fn1).nthCalledWith(3, {
		basic2: expect.objectContaining({ ...basic2, str: "NEW" }),
		basic3: expect.objectContaining(basic3),
	});
	// Delete everything.
	await collection.deleteAll();
	await Promise.resolve();
	expect(fn1).nthCalledWith(4, {});
	// Set basic8.
	await collection.doc("basic8").set(basic8);
	await Promise.resolve();
	expect(fn1).nthCalledWith(5, {
		basic8: expect.objectContaining(basic8),
	});
	// Unsubscribe fn1.
	expect(un1()).toBe(undefined);
	// Delete basic8 (shouldn't call fn1).
	await collection.doc("basic8").delete();
	await Promise.resolve();
	expect(fn1).toBeCalledTimes(5);
	// Check end result.
	expect(await collection.results).toEqual({});
});
