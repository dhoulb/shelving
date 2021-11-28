import { AscendingSort, DescendingSort } from "../index.js";
import { expectOrderedKeys } from "../test/util.js";

const a = { str: "B", num: 3 };
const b = { str: "C", num: 1 };
const c = { str: "A", num: 4 };
const d = { str: "D", num: 2 };

const allRand = Object.entries({ b, d, c, a });

const idAsc = ["a", "b", "c", "d"];
const idDesc = ["d", "c", "b", "a"];
const strAsc = ["c", "a", "b", "d"];
const strDesc = ["d", "b", "a", "c"];
const numAsc = ["b", "d", "a", "c"];
const numDesc = ["c", "a", "d", "b"];

test("Sort", () => {
	// Sort empty.
	expectOrderedKeys(new AscendingSort("str").derive([]), []);
	// Sort by id (change).
	expectOrderedKeys(new AscendingSort("id").derive(allRand), idAsc);
	expectOrderedKeys(new AscendingSort("id").derive(allRand), idAsc);
	// Sort by string (change).
	expectOrderedKeys(new AscendingSort("str").derive(allRand), strAsc);
	expectOrderedKeys(new DescendingSort("str").derive(allRand), strDesc);
	// Sort by number (change).
	expectOrderedKeys(new AscendingSort("num").derive(allRand), numAsc);
	expectOrderedKeys(new DescendingSort("num").derive(allRand), numDesc);
});
