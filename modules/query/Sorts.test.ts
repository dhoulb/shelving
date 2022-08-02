import { expectOrderedKeys } from "../test/util.js";
import { Sorts, Sort } from "../index.js";

type SortableEntity = { id: string; first: string; second: number };

const a: SortableEntity = { id: "a", first: "B", second: 1 };
const b: SortableEntity = { id: "b", first: "B", second: 2 };
const c: SortableEntity = { id: "c", first: "A", second: 4 };
const d: SortableEntity = { id: "d", first: "A", second: 3 };

const allRand: ReadonlyArray<SortableEntity> = [b, d, c, a];

test("Sorts", () => {
	// Typescript.
	const sort1: Sorts<{ a: number }> = new Sorts<{ a: number }>();
	// No sort orders.
	expectOrderedKeys(new Sorts<SortableEntity>().transform(allRand), ["b", "d", "c", "a"]);
	expect(new Sorts<SortableEntity>().transform(allRand)).toBe(allRand); // Passes through unchanged for efficiency.
	// One sort order.
	expectOrderedKeys(new Sorts<SortableEntity>(new Sort("id")).transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Sorts<SortableEntity>(new Sort("!id")).transform(allRand), ["d", "c", "b", "a"]);
	expectOrderedKeys(new Sorts<SortableEntity>(new Sort("second")).transform(allRand), ["a", "b", "d", "c"]);
	expectOrderedKeys(new Sorts<SortableEntity>(new Sort("!second")).transform(allRand), ["c", "d", "b", "a"]);
	// Two sort orders (where second is relevant).
	expectOrderedKeys(new Sorts<SortableEntity>(new Sort("first"), new Sort("id")).transform(allRand), ["c", "d", "a", "b"]);
	expectOrderedKeys(new Sorts<SortableEntity>(new Sort("!first"), new Sort("id")).transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new Sorts<SortableEntity>(new Sort("first"), new Sort("second")).transform(allRand), ["d", "c", "a", "b"]);
	expectOrderedKeys(new Sorts<SortableEntity>(new Sort("!first"), new Sort("second")).transform(allRand), ["a", "b", "d", "c"]);
	expectOrderedKeys(new Sorts<SortableEntity>(new Sort("first"), new Sort("!second")).transform(allRand), ["c", "d", "b", "a"]);
	expectOrderedKeys(new Sorts<SortableEntity>(new Sort("!first"), new Sort("!second")).transform(allRand), ["b", "a", "c", "d"]);
	// Two sort orders (but second isn't relevant).
	expectOrderedKeys(new Sorts<SortableEntity>(new Sort("second"), new Sort("first")).transform(allRand), ["a", "b", "d", "c"]);
	expectOrderedKeys(new Sorts<SortableEntity>(new Sort("!second"), new Sort("first")).transform(allRand), ["c", "d", "b", "a"]);
});
