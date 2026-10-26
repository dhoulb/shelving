import { describe, expect, test } from "bun:test";
import type { ImmutableArray } from "shelving/util/array";
import { getIdentifiers } from "shelving/util/item";
import {
	filterQueryItems,
	getQueryAfter,
	getQueryBefore,
	getQueryFilters,
	getQueryItemsAfter,
	getQueryOrders,
	matchQueryItem,
	queryItems,
	sortQueryItems,
} from "shelving/util/query";
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
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: "id" })), ["a", "b", "c", "d"]);
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: "!id" })), ["d", "c", "b", "a"]);
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: "num" })), ["a", "b", "d", "c"]);
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: "!num" })), ["c", "d", "b", "a"]);
	// Two sort orders (where num is relevant).
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: ["str", "id"] })), ["c", "d", "a", "b"]);
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: ["!str", "id"] })), ["a", "b", "c", "d"]);
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: ["str", "num"] })), ["d", "c", "a", "b"]);
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: ["!str", "num"] })), ["a", "b", "d", "c"]);
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: ["str", "!num"] })), ["c", "d", "b", "a"]);
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: ["!str", "!num"] })), ["b", "a", "c", "d"]);
	// Two sort orders (but num isn't relevant).
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: ["num", "str"] })), ["a", "b", "d", "c"]);
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: ["!num", "str"] })), ["c", "d", "b", "a"]);
	// Sort by deep number (change).
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: "sub.num" })), ["b", "d", "a", "c"]);
	expectOrderedItems(sortQueryItems(unsorted, getQueryOrders({ $order: "!sub.num" })), ["c", "a", "d", "b"]);
});
describe("filterQueryItems()", () => {
	test("is", () => {
		// Match plain.
		expect(matchQueryItem(basic1, getQueryFilters({ str: "aaa" }))).toBe(true);
		expect(matchQueryItem(basic2, getQueryFilters({ str: "aaa" }))).toBe(false);
		expect(matchQueryItem(basic1, getQueryFilters({ id: "basic1" }))).toBe(true);
		expect(matchQueryItem(basic2, getQueryFilters({ id: "basic1" }))).toBe(false);
		// Filter plain.
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ str: "aaa" })), ["basic1"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ str: "NOPE" })), []);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ num: 300 })), ["basic3"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ num: 999999 })), []);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ group: "a" })), ["basic1", "basic2", "basic3"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ group: "b" })), ["basic4", "basic5", "basic6"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ group: "c" })), ["basic7", "basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ id: "basic5" })), ["basic5"]);
		// Match deep.
		expect(matchQueryItem(basic1, getQueryFilters({ "sub.str": "aaa" }))).toBe(true);
		expect(matchQueryItem(basic2, getQueryFilters({ "sub.str": "aaa" }))).toBe(false);
		// Filter deep.
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "sub.str": "aaa" })), ["basic1"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "sub.str": "NOPE" })), []);
	});
	test("in", () => {
		// Match array.
		expect(matchQueryItem(basic1, getQueryFilters({ str: ["aaa"] }))).toBe(true);
		expect(matchQueryItem(basic2, getQueryFilters({ str: ["aaa"] }))).toBe(false);
		expect(matchQueryItem(basic1, getQueryFilters({ id: ["basic1"] }))).toBe(true);
		expect(matchQueryItem(basic2, getQueryFilters({ id: ["basic1"] }))).toBe(false);
	});
	test("not", () => {
		// Match plain.
		expect(matchQueryItem(basic1, getQueryFilters({ "!str": "aaa" }))).toBe(false);
		expect(matchQueryItem(basic2, getQueryFilters({ "!str": "aaa" }))).toBe(true);
		expect(matchQueryItem(basic1, getQueryFilters({ "!id": "basic1" }))).toBe(false);
		expect(matchQueryItem(basic2, getQueryFilters({ "!id": "basic1" }))).toBe(true);
		// Filter plain.
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "!str": "aaa" })), [
			"basic2",
			"basic3",
			"basic4",
			"basic5",
			"basic6",
			"basic7",
			"basic8",
			"basic9",
		]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "!group": "a" })), [
			"basic4",
			"basic5",
			"basic6",
			"basic7",
			"basic8",
			"basic9",
		]);
		// Match deep.
		expect(matchQueryItem(basic1, getQueryFilters({ "!sub.str": "aaa" }))).toBe(false);
		expect(matchQueryItem(basic2, getQueryFilters({ "!sub.str": "aaa" }))).toBe(true);
		// Filter deep.
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "!sub.str": "aaa" })), [
			"basic2",
			"basic3",
			"basic4",
			"basic5",
			"basic6",
			"basic7",
			"basic8",
			"basic9",
		]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "!sub.str": "NOPE" })), [
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
		expect(matchQueryItem(basic1, getQueryFilters({ "!str": ["aaa"] }))).toBe(false);
		expect(matchQueryItem(basic2, getQueryFilters({ "!str": ["aaa"] }))).toBe(true);
		expect(matchQueryItem(basic1, getQueryFilters({ "!id": ["basic1"] }))).toBe(false);
		expect(matchQueryItem(basic2, getQueryFilters({ "!id": ["basic1"] }))).toBe(true);
	});
	test("contains", () => {
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters<BasicData>({ "tags[]": "odd" })), [
			"basic1",
			"basic3",
			"basic5",
			"basic7",
			"basic9",
		]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters<BasicData>({ "tags[]": "even" })), [
			"basic2",
			"basic4",
			"basic6",
			"basic8",
		]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters<BasicData>({ "tags[]": "prime" })), [
			"basic1",
			"basic2",
			"basic3",
			"basic5",
			"basic7",
		]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters<BasicData>({ "tags[]": "NOPE" })), []);
	});
	test("lt", () => {
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "num<": 500 })), ["basic1", "basic2", "basic3", "basic4"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "num<": 0 })), []);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "num<": 1000 })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "str<": "ddd" })), ["basic1", "basic2", "basic3"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "str<": "a" })), []);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "str<": "zzz" })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "id<": "basic3" })), ["basic1", "basic2"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "id<": "zzzzzz" })), getIdentifiers(basics));
	});
	test("lte", () => {
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "num<=": 500 })), ["basic1", "basic2", "basic3", "basic4", "basic5"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "num<=": 0 })), []);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "num<=": 1000 })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "str<=": "ddd" })), ["basic1", "basic2", "basic3", "basic4"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "str<=": "a" })), []);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "str<=": "zzz" })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "id<=": "basic3" })), ["basic1", "basic2", "basic3"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "id<=": "zzzzzz" })), getIdentifiers(basics));
	});
	test("gt", () => {
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "num>": 500 })), ["basic6", "basic7", "basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "num>": 1000 })), []);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "num>": 0 })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "str>": "eee" })), ["basic6", "basic7", "basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "str>": "kkk" })), []);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "str>": "" })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "id>": "basic7" })), ["basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "id>": "" })), getIdentifiers(basics));
	});
	test("gte", () => {
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "num>=": 500 })), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "num>=": 1000 })), []);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "num>=": 0 })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "str>=": "eee" })), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "str>=": "kkk" })), []);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "str>=": "" })), getIdentifiers(basics));
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "id>=": "basic7" })), ["basic7", "basic8", "basic9"]);
		expectUnorderedItems(filterQueryItems(basics, getQueryFilters({ "id>=": "" })), getIdentifiers(basics));
	});
});
test("queryItems()", () => {
	expectOrderedItems(queryItems(basics, { "num>=": 500, $order: "!str", $limit: 3 }), ["basic9", "basic8", "basic7"]);
	expectOrderedItems(queryItems(basics, { "tags[]": "even", $order: "!num", $limit: 2 }), ["basic8", "basic6"]);
});

describe("getQueryAfter()", () => {
	test("adds an inclusive range on the first order key", () => {
		expect(getQueryAfter<BasicData>({ $order: "num" }, basic1)).toEqual({ $order: "num", "num>=": 100 });
		expect(getQueryAfter<BasicData>({ $order: ["!num", "str"] }, basic1)).toEqual({ $order: ["!num", "str"], "num<=": 100 });
	});
	test("keeps a narrower range that already exists", () => {
		expect(getQueryAfter<BasicData>({ $order: "num", "num>=": 150 }, basic1)).toEqual({ $order: "num", "num>=": 150 });
		expect(getQueryAfter<BasicData>({ $order: "num", "num>=": 50 }, basic1)).toEqual({ $order: "num", "num>=": 100 });
	});
	test("returns the items at or after the item", () => {
		expectOrderedItems(queryItems(basics, getQueryAfter({ $order: "num" }, basic2)), [
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
	test("throws without $order", () => {
		expect(() => getQueryAfter({}, basic1)).toThrow();
	});
});

describe("getQueryBefore()", () => {
	test("adds an inclusive range on the first order key", () => {
		expect(getQueryBefore<BasicData>({ $order: "num" }, basic1)).toEqual({ $order: "num", "num<=": 100 });
		expect(getQueryBefore<BasicData>({ $order: "!num" }, basic1)).toEqual({ $order: "!num", "num>=": 100 });
	});
	test("returns the items at or before the item", () => {
		expectOrderedItems(queryItems(basics, getQueryBefore({ $order: "num" }, basic2)), ["basic1", "basic2"]);
	});
	test("throws without $order", () => {
		expect(() => getQueryBefore({}, basic1)).toThrow();
	});
});

test("getQueryAfter() and getQueryBefore() throw when the item has no value for the first order key", () => {
	const item = { id: "a" } as unknown as BasicData;
	expect(() => getQueryAfter<BasicData>({ $order: "num" }, item)).toThrow();
	expect(() => getQueryBefore<BasicData>({ $order: "num" }, item)).toThrow();
});

describe("getQueryItemsAfter()", () => {
	type Row = { id: string; when: number };
	const a: Row = { id: "a", when: 1 };
	const b: Row = { id: "b", when: 2 };
	const c: Row = { id: "c", when: 2 };
	test("returns the query for the next page from the last item", () => {
		expect(getQueryItemsAfter<string, { when: number }>({ query: { $order: "when", $limit: 2 }, items: [a, b] })).toEqual({
			$order: "when",
			$limit: 3,
			"when>=": 2,
		});
	});
	test("grows the limit by every item with the same sort value as the last item", () => {
		expect(getQueryItemsAfter<string, { when: number }>({ query: { $order: "when", $limit: 3 }, items: [a, b, c] })).toEqual({
			$order: "when",
			$limit: 5,
			"when>=": 2,
		});
	});
	test("returns undefined when the page is not full", () => {
		expect(getQueryItemsAfter<string, { when: number }>({ query: { $order: "when", $limit: 3 }, items: [a, b] })).toBe(undefined);
	});
	test("returns undefined when the query has no limit", () => {
		expect(getQueryItemsAfter<string, { when: number }>({ query: { $order: "when" }, items: [a, b] })).toBe(undefined);
	});
	test("throws when a full page has no order", () => {
		expect(() => getQueryItemsAfter<string, { when: number }>({ query: { $limit: 1 }, items: [a] })).toThrow();
	});
});
