import { expectOrderedKeys } from "../test/util.js";
import { SortConstraints, SortConstraint } from "../index.js";

type SortableEntity = { id: string; first: string; second: number };

const a: SortableEntity = { id: "a", first: "B", second: 1 };
const b: SortableEntity = { id: "b", first: "B", second: 2 };
const c: SortableEntity = { id: "c", first: "A", second: 4 };
const d: SortableEntity = { id: "d", first: "A", second: 3 };

const allRand: ReadonlyArray<SortableEntity> = [b, d, c, a];

test("construct", () => {
	// Typescript.
	const sort1: SortConstraints<{ a: number }> = new SortConstraints<{ a: number }>();
	// No sort orders.
	expectOrderedKeys(new SortConstraints<SortableEntity>().transform(allRand), ["b", "d", "c", "a"]);
	expect(new SortConstraints<SortableEntity>().transform(allRand)).toBe(allRand); // Passes through unchanged for efficiency.
	// One sort order.
	expectOrderedKeys(new SortConstraints<SortableEntity>(new SortConstraint("id")).transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new SortConstraints<SortableEntity>(new SortConstraint("!id")).transform(allRand), ["d", "c", "b", "a"]);
	expectOrderedKeys(new SortConstraints<SortableEntity>(new SortConstraint("second")).transform(allRand), ["a", "b", "d", "c"]);
	expectOrderedKeys(new SortConstraints<SortableEntity>(new SortConstraint("!second")).transform(allRand), ["c", "d", "b", "a"]);
	// Two sort orders (where second is relevant).
	expectOrderedKeys(new SortConstraints<SortableEntity>(new SortConstraint("first"), new SortConstraint("id")).transform(allRand), ["c", "d", "a", "b"]);
	expectOrderedKeys(new SortConstraints<SortableEntity>(new SortConstraint("!first"), new SortConstraint("id")).transform(allRand), ["a", "b", "c", "d"]);
	expectOrderedKeys(new SortConstraints<SortableEntity>(new SortConstraint("first"), new SortConstraint("second")).transform(allRand), ["d", "c", "a", "b"]);
	expectOrderedKeys(new SortConstraints<SortableEntity>(new SortConstraint("!first"), new SortConstraint("second")).transform(allRand), ["a", "b", "d", "c"]);
	expectOrderedKeys(new SortConstraints<SortableEntity>(new SortConstraint("first"), new SortConstraint("!second")).transform(allRand), ["c", "d", "b", "a"]);
	expectOrderedKeys(new SortConstraints<SortableEntity>(new SortConstraint("!first"), new SortConstraint("!second")).transform(allRand), ["b", "a", "c", "d"]);
	// Two sort orders (but second isn't relevant).
	expectOrderedKeys(new SortConstraints<SortableEntity>(new SortConstraint("second"), new SortConstraint("first")).transform(allRand), ["a", "b", "d", "c"]);
	expectOrderedKeys(new SortConstraints<SortableEntity>(new SortConstraint("!second"), new SortConstraint("first")).transform(allRand), ["c", "d", "b", "a"]);
});
