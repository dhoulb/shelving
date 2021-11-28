import { expectOrderedKeys } from "../test/util.js";
import { Sorts, AscendingSort, DescendingSort } from "../index.js";

const a = { first: "B", second: 1 };
const b = { first: "B", second: 2 };
const c = { first: "A", second: 4 };
const d = { first: "A", second: 3 };

const allRand = Object.entries({ b, d, c, a });

test("Sorts", () => {
	// Typescript.
	const sort1: Sorts<{ a: number }> = new Sorts<{ a: number }>();
	// No sort orders.
	expectOrderedKeys(new Sorts().derive(allRand), ["b", "d", "c", "a"]);
	expect(new Sorts().derive(allRand)).toBe(allRand); // Passes through unchanged for efficiency.
	// One sort order.
	expectOrderedKeys(new Sorts(new AscendingSort("id")).derive(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Sorts(new DescendingSort("id")).derive(allRand), ["d", "c", "b", "a"]);
	expectOrderedKeys(new Sorts(new AscendingSort("second")).derive(allRand), ["a", "b", "d", "c"]);
	expectOrderedKeys(new Sorts(new DescendingSort("second")).derive(allRand), ["c", "d", "b", "a"]);
	// Two sort orders (where second is relevant).
	expectOrderedKeys(new Sorts(new AscendingSort("first"), new AscendingSort("id")).derive(allRand), ["c", "d", "a", "b"]);
	expectOrderedKeys(new Sorts(new DescendingSort("first"), new AscendingSort("id")).derive(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Sorts(new AscendingSort("first"), new AscendingSort("second")).derive(allRand), ["d", "c", "a", "b"]);
	expectOrderedKeys(new Sorts(new DescendingSort("first"), new AscendingSort("second")).derive(allRand), ["a", "b", "d", "c"]);
	expectOrderedKeys(new Sorts(new AscendingSort("first"), new DescendingSort("second")).derive(allRand), ["c", "d", "b", "a"]);
	expectOrderedKeys(new Sorts(new DescendingSort("first"), new DescendingSort("second")).derive(allRand), ["b", "a", "c", "d"]);
	// Two sort orders (but second isn't relevant).
	expectOrderedKeys(new Sorts(new AscendingSort("second"), new AscendingSort("first")).derive(allRand), ["a", "b", "d", "c"]);
	expectOrderedKeys(new Sorts(new DescendingSort("second"), new AscendingSort("first")).derive(allRand), ["c", "d", "b", "a"]);
});
