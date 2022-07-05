import { Query, Filter, Sort, Filters, Sorts, ImmutableArray } from "../index.js";
import { expectOrderedKeys, expectUnorderedKeys } from "../test/index.js";

type T = { id: string; str: string; num: number; type: "alpha" | "beta"; arr: ImmutableArray<string> };
const a: T = { id: "a", str: "Z", num: 3, type: "alpha", arr: ["a", "b"] };
const b: T = { id: "b", str: "Y", num: 1, type: "alpha", arr: ["b", "c"] };
const c: T = { id: "c", str: "W", num: 4, type: "beta", arr: ["c", "d"] };
const d: T = { id: "d", str: "X", num: 2, type: "beta", arr: ["d", "e"] };

const allRand = [b, d, c, a];
const allAsc = [a, b, c, d];

const NUM_GT_2 = new Filter<T>("num", "GT", 2);
const STR_IN_Z_OR_X = new Filter<T>("str", "IN", ["Z", "X"]);
const TYPE_ALPHA = new Filter<T>("type", "IS", "alpha");

const ID_ASC = new Sort<T>("id", "ASC");
const ID_DESC = new Sort<T>("id", "DESC");
const STR_ASC = new Sort<T>("str", "ASC");
const STR_DESC = new Sort<T>("str", "DESC");
const NUM_ASC = new Sort<T>("num", "ASC");
const NUM_DESC = new Sort<T>("num", "DESC");
const TYPE_ASC = new Sort<T>("type", "ASC");
const TYPE_DESC = new Sort<T>("type", "DESC");

test("Basic tests", () => {
	// Empty.
	expectUnorderedKeys(new Query<T>().transform([]), []);
	expectUnorderedKeys(new Query<T>(new Filters(NUM_GT_2), new Sorts(ID_ASC), 20).transform([]), []);
});
test("Sorting", () => {
	// Creating with `sort()`
	expect(new Query<T>().sort("id")).toEqual(new Query<T>(undefined, new Sorts(ID_ASC)));
	expect(new Query<T>().sort("id", "!type")).toEqual(new Query<T>(undefined, new Sorts(ID_ASC, TYPE_DESC)));
	// Constructing with sorts.
	expectOrderedKeys(new Query<T>(undefined, new Sorts(ID_ASC)).transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query<T>(undefined, new Sorts(STR_ASC)).transform(allRand), ["c", "d", "b", "a"]);
	expectOrderedKeys(new Query<T>(undefined, new Sorts(NUM_DESC)).transform(allRand), ["c", "a", "d", "b"]);
	expectOrderedKeys(new Query<T>(undefined, new Sorts(TYPE_ASC, ID_ASC)).transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query<T>(undefined, new Sorts(TYPE_ASC, ID_DESC)).transform(allRand), ["b", "a", "d", "c"]);
	expectOrderedKeys(new Query<T>(undefined, new Sorts(TYPE_DESC, ID_ASC)).transform(allRand), ["c", "d", "a", "b"]);
	expectOrderedKeys(new Query<T>(undefined, new Sorts(TYPE_DESC, ID_DESC)).transform(allRand), ["d", "c", "b", "a"]);
	// Adding sorts.
	expectOrderedKeys(new Query<T>().sort("id").transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query<T>().sort("str").transform(allRand), ["c", "d", "b", "a"]);
	expectOrderedKeys(new Query<T>().sort("!num").transform(allRand), ["c", "a", "d", "b"]);
	expectOrderedKeys(new Query<T>().sort("type").sort("id").transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query<T>().sort("type").sort("!id").transform(allRand), ["b", "a", "d", "c"]);
	expectOrderedKeys(new Query<T>().sort("!type").sort("id").transform(allRand), ["c", "d", "a", "b"]);
	expectOrderedKeys(new Query<T>().sort("!type").sort("!id").transform(allRand), ["d", "c", "b", "a"]);
});
test("Filtering", () => {
	// Creating with `filter()`.
	expect(new Query<T>().filter("id", "abc")).toEqual(new Query<T>(new Filters(new Filter("id", "IS", "abc"))));
	expect(new Query<T>().filter("!id", "abc")).toEqual(new Query<T>(new Filters(new Filter("id", "NOT", "abc"))));
	expect(new Query<T>().filter("arr[]", "abc")).toEqual(new Query<T>(new Filters(new Filter("arr", "CONTAINS", "abc"))));
	expect(new Query<T>().filter("id>", "abc")).toEqual(new Query<T>(new Filters(new Filter("id", "GT", "abc"))));
	expect(new Query<T>().filter("id>=", "abc")).toEqual(new Query<T>(new Filters(new Filter("id", "GTE", "abc"))));
	expect(new Query<T>().filter("id<", "abc")).toEqual(new Query<T>(new Filters(new Filter("id", "LT", "abc"))));
	expect(new Query<T>().filter("id<=", "abc")).toEqual(new Query<T>(new Filters(new Filter("id", "LTE", "abc"))));
	// Constructing with filtering.
	expectUnorderedKeys(new Query<T>(new Filters(NUM_GT_2)).transform(allRand), ["a", "c"]);
	expectUnorderedKeys(new Query<T>(new Filters(STR_IN_Z_OR_X)).transform(allRand), ["a", "d"]);
	expectUnorderedKeys(new Query<T>(new Filters(TYPE_ALPHA)).transform(allRand), ["a", "b"]);
	// Adding filters.
	expectUnorderedKeys(new Query<T>().filter("num>", 2).transform(allRand), ["a", "c"]);
	expectUnorderedKeys(new Query<T>().filter("str", ["X", "Z"]).transform(allRand), ["a", "d"]);
	expectUnorderedKeys(new Query<T>().filter("type", "beta").transform(allRand), ["c", "d"]);
	expectUnorderedKeys(new Query<T>().filter("num>", 2).filter("str", "W").transform(allRand), ["c"]);
	expectUnorderedKeys(new Query<T>().filter("type", "beta").filter("num<=", 2).transform(allRand), ["d"]);
	expectUnorderedKeys(new Query<T>().filter("str", ["X", "Y", "Z"]).filter("type", "alpha").transform(allRand), ["a", "b"]);
});
test("Limiting", () => {
	// Creating.
	expect(new Query<T>().max(5)).toEqual(new Query<T>(undefined, undefined, 5));
	expect(new Query<T>().max(null)).toEqual(new Query<T>(undefined, undefined, null));
	// Constructing with slicing.
	expectOrderedKeys(new Query<T>(undefined, undefined, null).transform(allAsc), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query<T>(undefined, undefined, 4).transform(allAsc), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query<T>(undefined, undefined, 3).transform(allAsc), ["a", "b", "c"]);
	expectOrderedKeys(new Query<T>(undefined, undefined, 2).transform(allAsc), ["a", "b"]);
	expectOrderedKeys(new Query<T>(undefined, undefined, 1).transform(allAsc), ["a"]);
	expectOrderedKeys(new Query<T>(undefined, undefined, 0).transform(allAsc), []);
	// Adding slicing.
	expectOrderedKeys(new Query<T>().max(null).transform(allAsc), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query<T>().max(4).transform(allAsc), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query<T>().max(3).transform(allAsc), ["a", "b", "c"]);
	expectOrderedKeys(new Query<T>().max(2).transform(allAsc), ["a", "b"]);
	expectOrderedKeys(new Query<T>().max(1).transform(allAsc), ["a"]);
	expectOrderedKeys(new Query<T>().max(0).transform(allAsc), []);
});
test("Combined tests", () => {
	// Full queries.
	expectOrderedKeys(new Query<T>(new Filters(NUM_GT_2), new Sorts(NUM_ASC)).transform(allRand), ["a", "c"]);
	expectOrderedKeys(new Query<T>(new Filters(NUM_GT_2), new Sorts(NUM_DESC)).transform(allRand), ["c", "a"]);
	expectOrderedKeys(new Query<T>(new Filters(NUM_GT_2), new Sorts(ID_ASC)).transform(allRand), ["a", "c"]);
	expectOrderedKeys(new Query<T>(new Filters(NUM_GT_2), new Sorts(ID_DESC)).transform(allRand), ["c", "a"]);
	expectOrderedKeys(new Query<T>(new Filters(NUM_GT_2), new Sorts(NUM_ASC), 1).transform(allRand), ["a"]);
	expectOrderedKeys(new Query<T>(new Filters(NUM_GT_2), new Sorts(NUM_DESC), 1).transform(allRand), ["c"]);
	expectOrderedKeys(new Query<T>(new Filters(NUM_GT_2), new Sorts(ID_ASC), 1).transform(allRand), ["a"]);
	expectOrderedKeys(new Query<T>(new Filters(NUM_GT_2), new Sorts(ID_DESC), 1).transform(allRand), ["c"]);
	expectOrderedKeys(new Query<T>(new Filters(STR_IN_Z_OR_X), new Sorts(ID_ASC)).transform(allRand), ["a", "d"]);
	expectOrderedKeys(new Query<T>(new Filters(STR_IN_Z_OR_X), new Sorts(ID_DESC)).transform(allRand), ["d", "a"]);
	expectOrderedKeys(new Query<T>(new Filters(TYPE_ALPHA), new Sorts(STR_ASC)).transform(allRand), ["b", "a"]);
	expectOrderedKeys(new Query<T>(new Filters(TYPE_ALPHA), new Sorts(STR_DESC)).transform(allRand), ["a", "b"]);
	expectOrderedKeys(new Query<T>(new Filters(STR_IN_Z_OR_X), new Sorts(ID_ASC), 1).transform(allRand), ["a"]);
	expectOrderedKeys(new Query<T>(new Filters(STR_IN_Z_OR_X), new Sorts(ID_DESC), 1).transform(allRand), ["d"]);
	expectOrderedKeys(new Query<T>(new Filters(TYPE_ALPHA), new Sorts(STR_ASC), 1).transform(allRand), ["b"]);
	expectOrderedKeys(new Query<T>(new Filters(TYPE_ALPHA), new Sorts(STR_DESC), 1).transform(allRand), ["a"]);
});
test("toString()", () => {
	const q1 = new Query<T>(new Filters(NUM_GT_2, STR_IN_Z_OR_X), new Sorts(NUM_ASC, TYPE_DESC), 12);
	expect(q1.toString()).toBe(`{"num>":2,"str":["Z","X"],"sort":["num","!type"],"limit":12}`);
	const q2 = new Query<T>();
	expect(q2.toString()).toBe(`{}`);
});
