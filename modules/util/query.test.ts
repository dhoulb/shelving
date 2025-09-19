import { describe, expect, test } from "bun:test";
import type { ImmutableArray } from "../index.js";
import { filterQueryItems, getFilters, getIdentifiers, getOrders, matchQueryItem, queryItems, sortQueryItems } from "../index.js";
import type { BasicData } from "../test/index.js";
import { basic1, basic2, basics, expectUnorderedItems } from "../test/index.js";
import { expectOrderedItems } from "../test/util.js";

test("sortQueryItems()", () => {
	type SortableData = { id: string; str: string; num: number; sub: { str: string; num: number } };
	const a: SortableData = { id: "a", str: "B", num: 1, sub: { str: "B", num: 3 } };
	const b: SortableData = { id: "b", str: "B", num: 2, sub: { str: "C", num: 1 } };
	const c: SortableData = { id: "c", str: "A", num: 4, sub: { str: "A", num: 4 } };
	const d: SortableData = { id: "d", str: "A", num: 3, sub: { str: "D", num: 2 } };
	const unsorted: ImmutableArray<SortableData> = [b, d, c, a];
	// One sort order.
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: "id" })), ["a", "b", "c", "d"]);
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: "!id" })), ["d", "c", "b", "a"]);
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: "num" })), ["a", "b", "d", "c"]);
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: "!num" })), ["c", "d", "b", "a"]);
	// Two sort orders (where num is relevant).
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: ["str", "id"] })), ["c", "d", "a", "b"]);
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: ["!str", "id"] })), ["a", "b", "c", "d"]);
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: ["str", "num"] })), ["d", "c", "a", "b"]);
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: ["!str", "num"] })), ["a", "b", "d", "c"]);
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: ["str", "!num"] })), ["c", "d", "b", "a"]);
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: ["!str", "!num"] })), ["b", "a", "c", "d"]);
	// Two sort orders (but num isn't relevant).
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: ["num", "str"] })), ["a", "b", "d", "c"]);
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: ["!num", "str"] })), ["c", "d", "b", "a"]);
	// Sort by deep number (change).
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: "sub.num" })), ["b", "d", "a", "c"]);
	expectOrderedItems(sortQueryItems(unsorted, getOrders({ $order: "!sub.num" })), ["c", "a", "d", "b"]);
});
describe("filterQueryItems()", () => {
	test("is", () => {
		// Match plain.
		expect(matchQueryItem(basic1, getFilters({ str: "aaa" }))).toBe(true);
		expect(matchQueryItem(basic2, getFilters({ str: "aaa" }))).toBe(false);
		expect(matchQueryItem(basic1, getFilters({ id: "basic1" }))).toBe(true);
		expect(matchQueryItem(basic2, getFilters({ id: "basic1" }))).toBe(false);
		// Filter plain.
		expectUnorderedItems(filterQueryItems(basics, getFilters({ str: "aaa" })), ["basic1"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ str: "NOPE" })), []);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ num: 300 })), ["basic3"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ num: 999999 })), []);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ group: "a" })), ["basic1", "basic2", "basic3"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ group: "b" })), ["basic4", "basic5", "basic6"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ group: "c" })), ["basic7", "basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ id: "basic5" })), ["basic5"]);
		// Match deep.
		expect(matchQueryItem(basic1, getFilters({ "sub.str": "aaa" }))).toBe(true);
		expect(matchQueryItem(basic2, getFilters({ "sub.str": "aaa" }))).toBe(false);
		// Filter deep.
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "sub.str": "aaa" })), ["basic1"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "sub.str": "NOPE" })), []);
	});
	test("in", () => {
		// Match array.
		expect(matchQueryItem(basic1, getFilters({ str: ["aaa"] }))).toBe(true);
		expect(matchQueryItem(basic2, getFilters({ str: ["aaa"] }))).toBe(false);
		expect(matchQueryItem(basic1, getFilters({ id: ["basic1"] }))).toBe(true);
		expect(matchQueryItem(basic2, getFilters({ id: ["basic1"] }))).toBe(false);
	});
	test("not", () => {
		// Match plain.
		expect(matchQueryItem(basic1, getFilters({ "!str": "aaa" }))).toBe(false);
		expect(matchQueryItem(basic2, getFilters({ "!str": "aaa" }))).toBe(true);
		expect(matchQueryItem(basic1, getFilters({ "!id": "basic1" }))).toBe(false);
		expect(matchQueryItem(basic2, getFilters({ "!id": "basic1" }))).toBe(true);
		// Filter plain.
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "!str": "aaa" })), [
			"basic2",
			"basic3",
			"basic4",
			"basic5",
			"basic6",
			"basic7",
			"basic8",
			"basic9",
		]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "!group": "a" })), [
			"basic4",
			"basic5",
			"basic6",
			"basic7",
			"basic8",
			"basic9",
		]);
		// Match deep.
		expect(matchQueryItem(basic1, getFilters({ "!sub.str": "aaa" }))).toBe(false);
		expect(matchQueryItem(basic2, getFilters({ "!sub.str": "aaa" }))).toBe(true);
		// Filter deep.
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "!sub.str": "aaa" })), [
			"basic2",
			"basic3",
			"basic4",
			"basic5",
			"basic6",
			"basic7",
			"basic8",
			"basic9",
		]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "!sub.str": "NOPE" })), [
			"basic1",
			"basic2",
			"basic3",
			"basic4",
			"basic5",
			"basic6",
			"basic7",
			"basic8",
			"basic9",
		]);
	});
	test("out", () => {
		// Match array.
		expect(matchQueryItem(basic1, getFilters({ "!str": ["aaa"] }))).toBe(false);
		expect(matchQueryItem(basic2, getFilters({ "!str": ["aaa"] }))).toBe(true);
		expect(matchQueryItem(basic1, getFilters({ "!id": ["basic1"] }))).toBe(false);
		expect(matchQueryItem(basic2, getFilters({ "!id": ["basic1"] }))).toBe(true);
	});
	test("contains", () => {
		expectUnorderedItems(filterQueryItems(basics, getFilters<BasicData>({ "tags[]": "odd" })), [
			"basic1",
			"basic3",
			"basic5",
			"basic7",
			"basic9",
		]);
		expectUnorderedItems(filterQueryItems(basics, getFilters<BasicData>({ "tags[]": "even" })), ["basic2", "basic4", "basic6", "basic8"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters<BasicData>({ "tags[]": "prime" })), [
			"basic1",
			"basic2",
			"basic3",
			"basic5",
			"basic7",
		]);
		expectUnorderedItems(filterQueryItems(basics, getFilters<BasicData>({ "tags[]": "NOPE" })), []);
	});
	test("lt", () => {
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "num<": 500 })), ["basic1", "basic2", "basic3", "basic4"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "num<": 0 })), []);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "num<": 1000 })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "str<": "ddd" })), ["basic1", "basic2", "basic3"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "str<": "a" })), []);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "str<": "zzz" })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "id<": "basic3" })), ["basic1", "basic2"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "id<": "zzzzzz" })), getIdentifiers(basics));
	});
	test("lte", () => {
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "num<=": 500 })), ["basic1", "basic2", "basic3", "basic4", "basic5"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "num<=": 0 })), []);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "num<=": 1000 })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "str<=": "ddd" })), ["basic1", "basic2", "basic3", "basic4"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "str<=": "a" })), []);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "str<=": "zzz" })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "id<=": "basic3" })), ["basic1", "basic2", "basic3"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "id<=": "zzzzzz" })), getIdentifiers(basics));
	});
	test("gt", () => {
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "num>": 500 })), ["basic6", "basic7", "basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "num>": 1000 })), []);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "num>": 0 })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "str>": "eee" })), ["basic6", "basic7", "basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "str>": "kkk" })), []);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "str>": "" })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "id>": "basic7" })), ["basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "id>": "" })), getIdentifiers(basics));
	});
	test("gte", () => {
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "num>=": 500 })), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "num>=": 1000 })), []);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "num>=": 0 })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "str>=": "eee" })), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "str>=": "kkk" })), []);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "str>=": "" })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "id>=": "basic7" })), ["basic7", "basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getFilters({ "id>=": "" })), getIdentifiers(basics));
	});
});
test("queryItems()", () => {
	expectOrderedItems(queryItems(basics, { "num>=": 500, $order: "!str", $limit: 3 }), ["basic9", "basic8", "basic7"]);
	expectOrderedItems(queryItems(basics, { "tags[]": "even", $order: "!num", $limit: 2 }), ["basic8", "basic6"]);
});
