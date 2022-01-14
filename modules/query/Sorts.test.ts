import { expectOrderedKeys } from "../test/util.js";
import { Sorts, Sort } from "../index.js";

const a = { first: "B", second: 1 };
const b = { first: "B", second: 2 };
const c = { first: "A", second: 4 };
const d = { first: "A", second: 3 };

const allRand = Object.entries({ b, d, c, a });

test("Sorts", () => {
	// Typescript.
	const sort1: Sorts<{ a: number }> = new Sorts<{ a: number }>();
	// No sort orders.
	expectOrderedKeys(new Sorts().transform(allRand), ["b", "d", "c", "a"]);
	expect(new Sorts().transform(allRand)).toBe(allRand); // Passes through unchanged for efficiency.
	// One sort order.
	expectOrderedKeys(new Sorts(new Sort("id", "ASC")).transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Sorts(new Sort("id", "DESC")).transform(allRand), ["d", "c", "b", "a"]);
	expectOrderedKeys(new Sorts(new Sort("second", "ASC")).transform(allRand), ["a", "b", "d", "c"]);
	expectOrderedKeys(new Sorts(new Sort("second", "DESC")).transform(allRand), ["c", "d", "b", "a"]);
	// Two sort orders (where second is relevant).
	expectOrderedKeys(new Sorts(new Sort("first", "ASC"), new Sort("id", "ASC")).transform(allRand), ["c", "d", "a", "b"]);
	expectOrderedKeys(new Sorts(new Sort("first", "DESC"), new Sort("id", "ASC")).transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Sorts(new Sort("first", "ASC"), new Sort("second", "ASC")).transform(allRand), ["d", "c", "a", "b"]);
	expectOrderedKeys(new Sorts(new Sort("first", "DESC"), new Sort("second", "ASC")).transform(allRand), ["a", "b", "d", "c"]);
	expectOrderedKeys(new Sorts(new Sort("first", "ASC"), new Sort("second", "DESC")).transform(allRand), ["c", "d", "b", "a"]);
	expectOrderedKeys(new Sorts(new Sort("first", "DESC"), new Sort("second", "DESC")).transform(allRand), ["b", "a", "c", "d"]);
	// Two sort orders (but second isn't relevant).
	expectOrderedKeys(new Sorts(new Sort("second", "ASC"), new Sort("first", "ASC")).transform(allRand), ["a", "b", "d", "c"]);
	expectOrderedKeys(new Sorts(new Sort("second", "DESC"), new Sort("first", "ASC")).transform(allRand), ["c", "d", "b", "a"]);
});
