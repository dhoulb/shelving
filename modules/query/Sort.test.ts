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
	expectOrderedKeys(new AscendingSort("str").transform([]), []);
	// Sort by id (change).
	expectOrderedKeys(new AscendingSort("id").transform(allRand), idAsc);
	expectOrderedKeys(new AscendingSort("id").transform(allRand), idAsc);
	// Sort by string (change).
	expectOrderedKeys(new AscendingSort("str").transform(allRand), strAsc);
	expectOrderedKeys(new DescendingSort("str").transform(allRand), strDesc);
	// Sort by number (change).
	expectOrderedKeys(new AscendingSort("num").transform(allRand), numAsc);
	expectOrderedKeys(new DescendingSort("num").transform(allRand), numDesc);
});
