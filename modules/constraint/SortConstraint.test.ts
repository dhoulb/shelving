import { SortConstraint } from "../index.js";
import { expectOrderedKeys } from "../test/util.js";

type SortableEntity = { id: string; str: string; num: number };

const a: SortableEntity = { id: "a", str: "B", num: 3 };
const b: SortableEntity = { id: "b", str: "C", num: 1 };
const c: SortableEntity = { id: "c", str: "A", num: 4 };
const d: SortableEntity = { id: "d", str: "D", num: 2 };

const allRand: ReadonlyArray<SortableEntity> = [b, d, c, a];

const idAsc = ["a", "b", "c", "d"];
const idDesc = ["d", "c", "b", "a"];
const strAsc = ["c", "a", "b", "d"];
const strDesc = ["d", "b", "a", "c"];
const numAsc = ["b", "d", "a", "c"];
const numDesc = ["c", "a", "d", "b"];

test("construct", () => {
	// Sort empty.
	expectOrderedKeys(new SortConstraint<SortableEntity>("str").transform([]), []);
	// Sort by id (change).
	expectOrderedKeys(new SortConstraint<SortableEntity>("id").transform(allRand), idAsc);
	expectOrderedKeys(new SortConstraint<SortableEntity>("id").transform(allRand), idAsc);
	// Sort by string (change).
	expectOrderedKeys(new SortConstraint<SortableEntity>("str").transform(allRand), strAsc);
	expectOrderedKeys(new SortConstraint<SortableEntity>("!str").transform(allRand), strDesc);
	// Sort by number (change).
	expectOrderedKeys(new SortConstraint<SortableEntity>("num").transform(allRand), numAsc);
	expectOrderedKeys(new SortConstraint<SortableEntity>("!num").transform(allRand), numDesc);
});
