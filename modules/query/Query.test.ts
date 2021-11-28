import { Query, Filter, Sort, Filters, Sorts, AscendingSort, DescendingSort } from "../index.js";
import { expectOrderedKeys, expectUnorderedKeys } from "../test/index.js";
import { EqualFilter, GreaterThanFilter, InArrayFilter } from "./Filter.js";

type T = { str: string; num: number; type: "alpha" | "beta" };
const a: T = { str: "Z", num: 3, type: "alpha" };
const b: T = { str: "Y", num: 1, type: "alpha" };
const c: T = { str: "W", num: 4, type: "beta" };
const d: T = { str: "X", num: 2, type: "beta" };

const allRand = Object.entries({ b, d, c, a });
const allAsc = Object.entries({ a, b, c, d });

const NUM_GT_2 = new GreaterThanFilter<T>("num", 2);
const STR_IN_Z_OR_X = new InArrayFilter<T>("str", ["Z", "X"]);
const TYPE_ALPHA = new EqualFilter<T>("type", "alpha");

const ID_ASC = new AscendingSort<T>("id");
const ID_DESC = new DescendingSort<T>("id");
const STR_ASC = new AscendingSort<T>("str");
const STR_DESC = new DescendingSort<T>("str");
const NUM_ASC = new AscendingSort<T>("num");
const NUM_DESC = new DescendingSort<T>("num");
const TYPE_ASC = new AscendingSort<T>("type");
const TYPE_DESC = new DescendingSort<T>("type");

test("Basic tests", () => {
	// Empty.
	expectUnorderedKeys(new Query().derive([]), []);
	expectUnorderedKeys(new Query(new Filters(NUM_GT_2), new Sorts(ID_ASC), 20).derive([]), []);
});
test("Sorting", () => {
	// Creating.
	expect(new Query().asc("id")).toEqual(new Query(undefined, new Sorts(ID_ASC)));
	// Constructing with sorts.
	expectOrderedKeys(new Query(undefined, new Sorts(ID_ASC)).derive(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query(undefined, new Sorts(STR_ASC)).derive(allRand), ["c", "d", "b", "a"]);
	expectOrderedKeys(new Query(undefined, new Sorts(NUM_DESC)).derive(allRand), ["c", "a", "d", "b"]);
	expectOrderedKeys(new Query(undefined, new Sorts(TYPE_ASC, ID_ASC)).derive(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query(undefined, new Sorts(TYPE_ASC, ID_DESC)).derive(allRand), ["b", "a", "d", "c"]);
	expectOrderedKeys(new Query(undefined, new Sorts(TYPE_DESC, ID_ASC)).derive(allRand), ["c", "d", "a", "b"]);
	expectOrderedKeys(new Query(undefined, new Sorts(TYPE_DESC, ID_DESC)).derive(allRand), ["d", "c", "b", "a"]);
	// Adding sorts.
	expectOrderedKeys(new Query().asc("id").derive(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query().asc("str").derive(allRand), ["c", "d", "b", "a"]);
	expectOrderedKeys(new Query().desc("num").derive(allRand), ["c", "a", "d", "b"]);
	expectOrderedKeys(new Query().asc("type").asc("id").derive(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query().asc("type").desc("id").derive(allRand), ["b", "a", "d", "c"]);
	expectOrderedKeys(new Query().desc("type").asc("id").derive(allRand), ["c", "d", "a", "b"]);
	expectOrderedKeys(new Query().desc("type").desc("id").derive(allRand), ["d", "c", "b", "a"]);
});
test("Filtering", () => {
	// Creating.
	expect(new Query().is("id", "abc")).toEqual(new Query(new Filters(new EqualFilter("id", "abc"))));
	// Constructing with filtering.
	expectUnorderedKeys(new Query(new Filters(NUM_GT_2)).derive(allRand), ["a", "c"]);
	expectUnorderedKeys(new Query(new Filters(STR_IN_Z_OR_X)).derive(allRand), ["a", "d"]);
	expectUnorderedKeys(new Query(new Filters(TYPE_ALPHA)).derive(allRand), ["a", "b"]);
	// Adding filters.
	expectUnorderedKeys(new Query().gt("num", 2).derive(allRand), ["a", "c"]);
	expectUnorderedKeys(new Query().in("str", ["X", "Z"]).derive(allRand), ["a", "d"]);
	expectUnorderedKeys(new Query().is("type", "beta").derive(allRand), ["c", "d"]);
	expectUnorderedKeys(new Query().gt("num", 2).is("str", "W").derive(allRand), ["c"]);
	expectUnorderedKeys(new Query().is("type", "beta").lte("num", 2).derive(allRand), ["d"]);
	expectUnorderedKeys(new Query().in("str", ["X", "Y", "Z"]).is("type", "alpha").derive(allRand), ["a", "b"]);
});
test("Limiting", () => {
	// Creating.
	expect(new Query().max(5)).toEqual(new Query(undefined, undefined, 5));
	expect(new Query().max(null)).toEqual(new Query(undefined, undefined, null));
	// Constructing with slicing.
	expectOrderedKeys(new Query(undefined, undefined, null).derive(allAsc), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query(undefined, undefined, 4).derive(allAsc), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query(undefined, undefined, 3).derive(allAsc), ["a", "b", "c"]);
	expectOrderedKeys(new Query(undefined, undefined, 2).derive(allAsc), ["a", "b"]);
	expectOrderedKeys(new Query(undefined, undefined, 1).derive(allAsc), ["a"]);
	expectOrderedKeys(new Query(undefined, undefined, 0).derive(allAsc), []);
	// Adding slicing.
	expectOrderedKeys(new Query().max(null).derive(allAsc), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query().max(4).derive(allAsc), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Query().max(3).derive(allAsc), ["a", "b", "c"]);
	expectOrderedKeys(new Query().max(2).derive(allAsc), ["a", "b"]);
	expectOrderedKeys(new Query().max(1).derive(allAsc), ["a"]);
	expectOrderedKeys(new Query().max(0).derive(allAsc), []);
});
test("Combined tests", () => {
	// Full queries.
	expectOrderedKeys(new Query(new Filters(NUM_GT_2), new Sorts(NUM_ASC)).derive(allRand), ["a", "c"]);
	expectOrderedKeys(new Query(new Filters(NUM_GT_2), new Sorts(NUM_DESC)).derive(allRand), ["c", "a"]);
	expectOrderedKeys(new Query(new Filters(NUM_GT_2), new Sorts(ID_ASC)).derive(allRand), ["a", "c"]);
	expectOrderedKeys(new Query(new Filters(NUM_GT_2), new Sorts(ID_DESC)).derive(allRand), ["c", "a"]);
	expectOrderedKeys(new Query(new Filters(NUM_GT_2), new Sorts(NUM_ASC), 1).derive(allRand), ["a"]);
	expectOrderedKeys(new Query(new Filters(NUM_GT_2), new Sorts(NUM_DESC), 1).derive(allRand), ["c"]);
	expectOrderedKeys(new Query(new Filters(NUM_GT_2), new Sorts(ID_ASC), 1).derive(allRand), ["a"]);
	expectOrderedKeys(new Query(new Filters(NUM_GT_2), new Sorts(ID_DESC), 1).derive(allRand), ["c"]);
	expectOrderedKeys(new Query(new Filters(STR_IN_Z_OR_X), new Sorts(ID_ASC)).derive(allRand), ["a", "d"]);
	expectOrderedKeys(new Query(new Filters(STR_IN_Z_OR_X), new Sorts(ID_DESC)).derive(allRand), ["d", "a"]);
	expectOrderedKeys(new Query(new Filters(TYPE_ALPHA), new Sorts(STR_ASC)).derive(allRand), ["b", "a"]);
	expectOrderedKeys(new Query(new Filters(TYPE_ALPHA), new Sorts(STR_DESC)).derive(allRand), ["a", "b"]);
	expectOrderedKeys(new Query(new Filters(STR_IN_Z_OR_X), new Sorts(ID_ASC), 1).derive(allRand), ["a"]);
	expectOrderedKeys(new Query(new Filters(STR_IN_Z_OR_X), new Sorts(ID_DESC), 1).derive(allRand), ["d"]);
	expectOrderedKeys(new Query(new Filters(TYPE_ALPHA), new Sorts(STR_ASC), 1).derive(allRand), ["b"]);
	expectOrderedKeys(new Query(new Filters(TYPE_ALPHA), new Sorts(STR_DESC), 1).derive(allRand), ["a"]);
});
