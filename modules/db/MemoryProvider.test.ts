import { createTestDatabase, allBasics, allPeople } from "../test";
import { MemoryProvider } from "..";

const { basic1, basic2, basic3, basic4, basic5, basic6, basic7, basic8, basic9 } = allBasics;
const { person1, person2, person3, person4, person5 } = allPeople;

test("MemoryProvider: set/get/delete documents", async () => {
	// Setup.
	const provider = MemoryProvider.create();
	const db = createTestDatabase(provider);
	const basics = db.docs("basics");
	const people = db.docs("people");

	// Add documents.
	expect(await basics.doc("basic1").set(basic1)).toBe(undefined);
	expect(await basics.doc("basic2").set(basic2)).toBe(undefined);
	expect(await basics.doc("basic3").set(basic3)).toBe(undefined);
	expect(await people.doc("person1").set(person1)).toBe(undefined);
	expect(await people.doc("person2").set(person2)).toBe(undefined);
	expect(await people.doc("person3").set(person3)).toBe(undefined);
	// Check documents.
	expect(await basics.doc("basic1").get()).toBe(basic1);
	expect(await basics.doc("basic2").get()).toBe(basic2);
	expect(await basics.doc("basic3").get()).toBe(basic3);
	expect(await basics.doc("basicNone").get()).toBe(undefined);
	expect(await basics.count).toBe(3);
	expect(await people.doc("person1").get()).toBe(person1);
	expect(await people.doc("person2").get()).toBe(person2);
	expect(await people.doc("person3").get()).toBe(person3);
	expect(await people.doc("peopleNone").get()).toBe(undefined);
	expect(await people.count).toBe(3);
	// Update documents.
	expect(await basics.doc("basic1").update({ str: "NEW" })).toBe(undefined);
	expect(await basics.doc("basic1").get()).toMatchObject({ ...basic1, str: "NEW" });
	// expect(await people.doc("person3").merge({ name: { first: "NEW" } })).toBe(undefined);
	// Merge documents.
	// expect(await people.doc("person3").get()).toMatchObject({ ...person3, name: { ...person3.name, first: "NEW" } });
	// Add new documents (with random IDs).
	const addedBasicId = await basics.add(basic9);
	expect(typeof addedBasicId).toBe("string");
	const addedPersonId = await people.add(person5);
	expect(typeof addedPersonId).toBe("string");
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
	const provider = MemoryProvider.create();
	const db = createTestDatabase(provider);
	const basics = db.docs("basics");
	const people = db.docs("people");
	// Change collections.
	await Promise.all(Object.entries(allBasics).map(([k, v]) => basics.doc(k).set(v)));
	await Promise.all(Object.entries(allPeople).map(([k, v]) => people.doc(k).set(v)));
	// Check collections.
	expect(await basics.results).toEqual(allBasics);
	expect(await basics.doc("basic1").get()).toEqual(basic1);
	expect(await basics.doc("basic6").get()).toEqual(basic6);
	expect(await basics.doc("basicNone").get()).toBe(undefined);
	expect(await people.results).toEqual(allPeople);
	expect(await people.doc("person4").get()).toEqual(person4);
	expect(await people.doc("peopleNone").get()).toBe(undefined);
	// Delete collections.
	expect(await basics.delete()).toBe(undefined);
	expect(await people.delete()).toBe(undefined);
	// Check collections.
	expect(await people.results).toEqual({});
	expect(await basics.results).toEqual({});
});
test("MemoryProvider: get queries", async () => {
	// Setup.
	const provider = MemoryProvider.create();
	const db = createTestDatabase(provider);
	const basics = db.docs("basics");
	await Promise.all(Object.entries(allBasics).map(([k, v]) => basics.doc(k).set(v)));
	// Equal queries.
	expect(await basics.is("str", "aaa").results).toEqual({ basic1 });
	expect(await basics.is("str", "NOPE").results).toEqual({});
	expect(await basics.is("num", 300).results).toEqual({ basic3 });
	expect(await basics.is("num", 999999).results).toEqual({});
	expect(await basics.is("group", "a").results).toEqual({ basic1, basic2, basic3 });
	expect(await basics.is("group", "b").results).toEqual({ basic4, basic5, basic6 });
	expect(await basics.is("group", "c").results).toEqual({ basic7, basic8, basic9 });
	// ArrayContains queries.
	expect(await basics.contains("tags", "odd").results).toEqual({ basic1, basic3, basic5, basic7, basic9 });
	expect(await basics.contains("tags", "even").results).toEqual({ basic2, basic4, basic6, basic8 });
	expect(await basics.contains("tags", "prime").results).toEqual({ basic1, basic2, basic3, basic5, basic7 });
	expect(await basics.contains("tags", "NOPE").results).toEqual({});
	// In queries.
	expect(await basics.in("num", [200, 600, 900, 999999]).results).toEqual({ basic2, basic6, basic9 });
	expect(await basics.in("str", ["aaa", "ddd", "eee", "NOPE"]).results).toEqual({ basic1, basic4, basic5 });
	expect(await basics.in("num", []).results).toEqual({});
	expect(await basics.in("str", []).results).toEqual({});
	// Sorting.
	expect(Object.keys(await basics.asc().results)).toEqual(Object.keys(allBasics).sort());
	expect(Object.keys(await basics.desc().results)).toEqual(Object.keys(allBasics).sort().reverse());
	expect(Object.keys(await basics.asc("str").results)).toEqual(Object.keys(allBasics).sort());
	expect(Object.keys(await basics.desc("str").results)).toEqual(Object.keys(allBasics).sort().reverse());
	expect(Object.keys(await basics.asc("num").results)).toEqual(Object.keys(allBasics).sort());
	expect(Object.keys(await basics.desc("num").results)).toEqual(Object.keys(allBasics).sort().reverse());
	// Limiting.
	expect(await basics.asc().limit(2).results).toEqual({ basic1, basic2 });
	// Combinations.
	expect(await basics.asc("id").limit(2).results).toEqual({ basic1, basic2 });
	expect(await basics.desc("id").limit(1).results).toEqual({ basic9 });
	expect(Object.keys(await basics.contains("tags", "prime").desc("id").limit(2).results)).toEqual(["basic7", "basic5"]);
});
test("MemoryProvider: subscribing to documents", async () => {
	// Setup.
	const provider = MemoryProvider.create();
	const db = createTestDatabase(provider);
	const basics = db.docs("basics");
	const doc = basics.doc("basic1");
	// Subscribe.
	const fn1 = jest.fn();
	const un1 = doc.subscribe(fn1);
	await Promise.resolve();
	expect(fn1).nthCalledWith(1, undefined);
	// Set.
	await doc.set(basic1);
	await Promise.resolve();
	expect(fn1).nthCalledWith(2, basic1);
	// Update.
	await doc.update({ str: "NEW" });
	await Promise.resolve();
	expect(fn1).nthCalledWith(3, expect.objectContaining({ ...basic1, str: "NEW" }));
	// Delete.
	await doc.delete();
	await Promise.resolve();
	expect(fn1).nthCalledWith(4, undefined);
	// Change unrelated documents.
	expect(fn1).toBeCalledTimes(4);
	await basics.doc("basic2").set(basic2);
	await basics.doc("basic2").update({ str: "NEW" });
	await basics.doc("basic2").delete();
	await basics.add(basic3);
	expect(fn1).toBeCalledTimes(4);
	// Unsubscribe.
	expect(un1()).toBe(undefined);
	// Set.
	await doc.set(basic1);
	expect(fn1).toBeCalledTimes(4);
});
test("MemoryProvider: subscribing to collections", async () => {
	// Setup.
	const provider = MemoryProvider.create();
	const db = createTestDatabase(provider);
	const basics = db.docs("basics");
	// Subscribe.
	const fn1 = jest.fn();
	const un1 = basics.subscribe(fn1);
	await Promise.resolve();
	expect(fn1).nthCalledWith(1, {}); // Empty at first (no last argument).
	// Add id1.
	const id1 = await basics.add(basic1);
	await Promise.resolve();
	expect(fn1).nthCalledWith(2, { [id1]: basic1 }); // id1 is added.
	// Subscribe.
	const fn2 = jest.fn();
	const un2 = basics.subscribe(fn2);
	await Promise.resolve();
	expect(fn2).nthCalledWith(1, { [id1]: basic1 });
	// Set basic2.
	await basics.doc("basic2").set(basic2);
	await Promise.resolve();
	expect(fn1).nthCalledWith(3, { [id1]: basic1, basic2 });
	expect(fn2).nthCalledWith(2, { [id1]: basic1, basic2 });
	// Change id1 and add basic3 and basic4.
	await Promise.all([basics.doc(id1).update({ str: "NEW" }), basics.doc("basic3").set(basic3), basics.doc("basic4").set(basic4)]);
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
	await basics.doc("basic4").delete();
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
	await basics.doc("basic3").update({ str: "NEW" });
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
	const provider = MemoryProvider.create();
	const db = createTestDatabase(provider);
	const basics = db.docs("basics");
	await basics.doc("basic6").set(basic6);
	await basics.doc("basic7").set(basic7);
	// Subscribe (should find only basic7).
	const fn1 = jest.fn();
	const un1 = basics.contains("tags", "odd").subscribe(fn1); // Query for odds.
	await Promise.resolve();
	expect(fn1).nthCalledWith(1, {
		basic7: expect.objectContaining(basic7),
	});
	// Set basic3 (should be added to result).
	await basics.doc("basic3").set(basic3);
	await Promise.resolve();
	expect(fn1).nthCalledWith(2, {
		basic3: expect.objectContaining(basic3),
		basic7: expect.objectContaining(basic7),
	});
	// Set basic2 (shouldn't call fn1).
	await basics.doc("basic2").set(basic2);
	await Promise.resolve();
	expect(fn1).toBeCalledTimes(2);
	// Change basic2 and basic3 (should have updated basic3 in result).
	await basics.in("id", ["basic2", "basic3"]).update({ str: "NEW" });
	await Promise.resolve();
	expect(fn1).nthCalledWith(3, {
		basic3: expect.objectContaining({ ...basic3, str: "NEW" }),
		basic7: expect.objectContaining(basic7),
	});
	// Delete basic3 and basic2.
	await Promise.all([basics.doc("basic2").delete(), basics.doc("basic3").delete()]);
	await Promise.resolve();
	expect(fn1).nthCalledWith(4, {
		basic7: expect.objectContaining(basic7),
	});
	// Unsubscribe fn1.
	expect(un1()).toBe(undefined);
	// Check end result.
	expect(await basics.results).toMatchObject({ basic6, basic7 });
});
test("MemoryProvider: subscribing to limit query", async () => {
	// Setup.
	const provider = MemoryProvider.create();
	const db = createTestDatabase(provider);
	const basics = db.docs("basics");
	await Promise.all(Object.entries(allBasics).map(([k, v]) => basics.doc(k).set(v)));
	// Subscribe (should find only basic7).
	const fn1 = jest.fn();
	const un1 = basics.asc("id").limit(2).subscribe(fn1); // Query for odds.
	await Promise.resolve();
	expect(fn1).nthCalledWith(1, {
		basic1: expect.objectContaining(basic1),
		basic2: expect.objectContaining(basic2),
	});
	// Delete basic9 (shouldn't affect result as it's outside the slice).
	await basics.doc("basic9").delete();
	await Promise.resolve();
	expect(fn1).toBeCalledTimes(1);
	// Delete basic1 (should be removed from result, which brings in basic3).
	await basics.doc("basic1").delete();
	await Promise.resolve();
	expect(fn1).nthCalledWith(2, {
		basic2: expect.objectContaining(basic2),
		basic3: expect.objectContaining(basic3),
	});
	// Change basic2 and basic3 (should have updated basic3 in result).
	await Promise.all([basics.doc("basic2").update({ str: "NEW" }), basics.doc("basic8").update({ str: "NEW" })]);
	await Promise.resolve();
	expect(fn1).nthCalledWith(3, {
		basic2: expect.objectContaining({ ...basic2, str: "NEW" }),
		basic3: expect.objectContaining(basic3),
	});
	// Delete everything.
	await basics.delete();
	await Promise.resolve();
	expect(fn1).nthCalledWith(4, {});
	// Set basic8.
	await basics.doc("basic8").set(basic8);
	await Promise.resolve();
	expect(fn1).nthCalledWith(5, {
		basic8: expect.objectContaining(basic8),
	});
	// Unsubscribe fn1.
	expect(un1()).toBe(undefined);
	// Delete basic8 (shouldn't call fn1).
	await basics.doc("basic8").delete();
	await Promise.resolve();
	expect(fn1).toBeCalledTimes(5);
	// Check end result.
	expect(await basics.results).toEqual({});
});
