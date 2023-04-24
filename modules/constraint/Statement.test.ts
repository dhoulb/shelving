import { Statement, Filter, Sort, Filters, Sorts, ImmutableArray } from "../index.js";
import { expectOrderedKeys, expectUnorderedKeys } from "../test/index.js";

type T = { id: string; str: string; num: number; type: "alpha" | "beta"; arr: ImmutableArray<string> };
const a: T = { id: "a", str: "Z", num: 3, type: "alpha", arr: ["a", "b"] };
const b: T = { id: "b", str: "Y", num: 1, type: "alpha", arr: ["b", "c"] };
const c: T = { id: "c", str: "W", num: 4, type: "beta", arr: ["c", "d"] };
const d: T = { id: "d", str: "X", num: 2, type: "beta", arr: ["d", "e"] };

const allRand = [b, d, c, a];
const allAsc = [a, b, c, d];

const NUM_GT_2 = new Filter<T>("num>", 2);
const STR_IN_Z_OR_X = new Filter<T>("str", ["Z", "X"]);
const TYPE_ALPHA = new Filter<T>("type", "alpha");

const ID_ASC = new Sort<T>("id");
const ID_DESC = new Sort<T>("!id");
const STR_ASC = new Sort<T>("str");
const STR_DESC = new Sort<T>("!str");
const NUM_ASC = new Sort<T>("num");
const NUM_DESC = new Sort<T>("!num");
const TYPE_ASC = new Sort<T>("type");
const TYPE_DESC = new Sort<T>("!type");

test("Basic tests", () => {
	// Empty.
	expectUnorderedKeys(new Statement<T>().transform([]), []);
	expectUnorderedKeys(new Statement<T>(new Filters(NUM_GT_2), new Sorts(ID_ASC), 20).transform([]), []);
});
test("Sorting", () => {
	// Creating with `sort()`
	expect(new Statement<T>().sort("id")).toEqual(new Statement<T>(undefined, new Sorts(ID_ASC)));
	expect(new Statement<T>().sort(["id", "!type"])).toEqual(new Statement<T>(undefined, new Sorts(ID_ASC, TYPE_DESC)));
	// Constructing with sorts.
	expectOrderedKeys(new Statement<T>(undefined, new Sorts(ID_ASC)).transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Statement<T>(undefined, new Sorts(STR_ASC)).transform(allRand), ["c", "d", "b", "a"]);
	expectOrderedKeys(new Statement<T>(undefined, new Sorts(NUM_DESC)).transform(allRand), ["c", "a", "d", "b"]);
	expectOrderedKeys(new Statement<T>(undefined, new Sorts(TYPE_ASC, ID_ASC)).transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Statement<T>(undefined, new Sorts(TYPE_ASC, ID_DESC)).transform(allRand), ["b", "a", "d", "c"]);
	expectOrderedKeys(new Statement<T>(undefined, new Sorts(TYPE_DESC, ID_ASC)).transform(allRand), ["c", "d", "a", "b"]);
	expectOrderedKeys(new Statement<T>(undefined, new Sorts(TYPE_DESC, ID_DESC)).transform(allRand), ["d", "c", "b", "a"]);
	// Adding sorts.
	expectOrderedKeys(new Statement<T>().sort("id").transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Statement<T>().sort("str").transform(allRand), ["c", "d", "b", "a"]);
	expectOrderedKeys(new Statement<T>().sort("!num").transform(allRand), ["c", "a", "d", "b"]);
	expectOrderedKeys(new Statement<T>().sort("type").sort("id").transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Statement<T>().sort("type").sort("!id").transform(allRand), ["b", "a", "d", "c"]);
	expectOrderedKeys(new Statement<T>().sort("!type").sort("id").transform(allRand), ["c", "d", "a", "b"]);
	expectOrderedKeys(new Statement<T>().sort("!type").sort("!id").transform(allRand), ["d", "c", "b", "a"]);
});
test("Filtering", () => {
	// Constructing with filtering.
	expectUnorderedKeys(new Statement<T>(new Filters(NUM_GT_2)).transform(allRand), ["a", "c"]);
	expectUnorderedKeys(new Statement<T>(new Filters(STR_IN_Z_OR_X)).transform(allRand), ["a", "d"]);
	expectUnorderedKeys(new Statement<T>(new Filters(TYPE_ALPHA)).transform(allRand), ["a", "b"]);
	// Adding filters.
	expectUnorderedKeys(new Statement<T>().filter({ "num>": 2 }).transform(allRand), ["a", "c"]);
	expectUnorderedKeys(new Statement<T>().filter({ str: ["X", "Z"] }).transform(allRand), ["a", "d"]);
	expectUnorderedKeys(new Statement<T>().filter({ type: "beta" }).transform(allRand), ["c", "d"]);
	expectUnorderedKeys(new Statement<T>().filter({ "num>": 2 }).filter({ str: "W" }).transform(allRand), ["c"]);
	expectUnorderedKeys(new Statement<T>().filter({ type: "beta" }).filter({ "num<=": 2 }).transform(allRand), ["d"]);
	expectUnorderedKeys(new Statement<T>().filter({ str: ["X", "Y", "Z"], type: "alpha" }).transform(allRand), ["a", "b"]);
});
test("Limiting", () => {
	// Creating.
	expect(new Statement<T>().max(5)).toEqual(new Statement<T>(undefined, undefined, 5));
	expect(new Statement<T>().max(null)).toEqual(new Statement<T>(undefined, undefined, null));
	// Constructing with slicing.
	expectOrderedKeys(new Statement<T>(undefined, undefined, null).transform(allAsc), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Statement<T>(undefined, undefined, 4).transform(allAsc), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Statement<T>(undefined, undefined, 3).transform(allAsc), ["a", "b", "c"]);
	expectOrderedKeys(new Statement<T>(undefined, undefined, 2).transform(allAsc), ["a", "b"]);
	expectOrderedKeys(new Statement<T>(undefined, undefined, 1).transform(allAsc), ["a"]);
	expectOrderedKeys(new Statement<T>(undefined, undefined, 0).transform(allAsc), []);
	// Adding slicing.
	expectOrderedKeys(new Statement<T>().max(null).transform(allAsc), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Statement<T>().max(4).transform(allAsc), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Statement<T>().max(3).transform(allAsc), ["a", "b", "c"]);
	expectOrderedKeys(new Statement<T>().max(2).transform(allAsc), ["a", "b"]);
	expectOrderedKeys(new Statement<T>().max(1).transform(allAsc), ["a"]);
	expectOrderedKeys(new Statement<T>().max(0).transform(allAsc), []);
});
test("Combined tests", () => {
	// Full queries.
	expectOrderedKeys(new Statement<T>(new Filters(NUM_GT_2), new Sorts(NUM_ASC)).transform(allRand), ["a", "c"]);
	expectOrderedKeys(new Statement<T>(new Filters(NUM_GT_2), new Sorts(NUM_DESC)).transform(allRand), ["c", "a"]);
	expectOrderedKeys(new Statement<T>(new Filters(NUM_GT_2), new Sorts(ID_ASC)).transform(allRand), ["a", "c"]);
	expectOrderedKeys(new Statement<T>(new Filters(NUM_GT_2), new Sorts(ID_DESC)).transform(allRand), ["c", "a"]);
	expectOrderedKeys(new Statement<T>(new Filters(NUM_GT_2), new Sorts(NUM_ASC), 1).transform(allRand), ["a"]);
	expectOrderedKeys(new Statement<T>(new Filters(NUM_GT_2), new Sorts(NUM_DESC), 1).transform(allRand), ["c"]);
	expectOrderedKeys(new Statement<T>(new Filters(NUM_GT_2), new Sorts(ID_ASC), 1).transform(allRand), ["a"]);
	expectOrderedKeys(new Statement<T>(new Filters(NUM_GT_2), new Sorts(ID_DESC), 1).transform(allRand), ["c"]);
	expectOrderedKeys(new Statement<T>(new Filters(STR_IN_Z_OR_X), new Sorts(ID_ASC)).transform(allRand), ["a", "d"]);
	expectOrderedKeys(new Statement<T>(new Filters(STR_IN_Z_OR_X), new Sorts(ID_DESC)).transform(allRand), ["d", "a"]);
	expectOrderedKeys(new Statement<T>(new Filters(TYPE_ALPHA), new Sorts(STR_ASC)).transform(allRand), ["b", "a"]);
	expectOrderedKeys(new Statement<T>(new Filters(TYPE_ALPHA), new Sorts(STR_DESC)).transform(allRand), ["a", "b"]);
	expectOrderedKeys(new Statement<T>(new Filters(STR_IN_Z_OR_X), new Sorts(ID_ASC), 1).transform(allRand), ["a"]);
	expectOrderedKeys(new Statement<T>(new Filters(STR_IN_Z_OR_X), new Sorts(ID_DESC), 1).transform(allRand), ["d"]);
	expectOrderedKeys(new Statement<T>(new Filters(TYPE_ALPHA), new Sorts(STR_ASC), 1).transform(allRand), ["b"]);
	expectOrderedKeys(new Statement<T>(new Filters(TYPE_ALPHA), new Sorts(STR_DESC), 1).transform(allRand), ["a"]);
});
test("toString()", () => {
	const q1 = new Statement<T>(new Filters(NUM_GT_2, STR_IN_Z_OR_X), new Sorts(NUM_ASC, TYPE_DESC), 12);
	expect(q1.toString()).toBe(`"filters":{"num>":2,"str":["Z","X"]},"sorts":["num","!type"],"limit":12`);
	const q2 = new Statement<T>(undefined, undefined, 12);
	expect(q2.toString()).toBe('"limit":12');
	const q3 = new Statement<T>();
	expect(q3.toString()).toBe("");
});
