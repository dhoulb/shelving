import { Sorts, Sort, Data } from "..";

const a = { first: "B", second: 1 };
const b = { first: "B", second: 2 };
const c = { first: "A", second: 4 };
const d = { first: "A", second: 3 };
const all = { b, c, a, d };

test("Sorts: types", () => {
	const sort1: Sorts<{ a: number }> = new Sorts<{ a: number }>();
	// Should allow a wider type.
	const sort2: Sorts<Data> = new Sorts<{ a: number }>();
});
test("Sorts: sorting", () => {
	// One sort order.
	expect(Object.keys(new Sorts([new Sort("id")]).results(all))).toEqual(["a", "b", "c", "d"]);
	expect(Object.keys(new Sorts([new Sort("id", "DESC")]).results(all))).toEqual(["d", "c", "b", "a"]);
	expect(Object.keys(new Sorts([new Sort("second", "ASC")]).results(all))).toEqual(["a", "b", "d", "c"]);
	expect(Object.keys(new Sorts([new Sort("second", "DESC")]).results(all))).toEqual(["c", "d", "b", "a"]);
	// Two sort orders (where second is relevant).
	expect(Object.keys(new Sorts([new Sort("first", "ASC"), new Sort("id")]).results(all))).toEqual(["c", "d", "a", "b"]);
	expect(Object.keys(new Sorts([new Sort("first", "DESC"), new Sort("id")]).results(all))).toEqual(["a", "b", "c", "d"]);
	expect(Object.keys(new Sorts([new Sort("first", "ASC"), new Sort("second", "ASC")]).results(all))).toEqual(["d", "c", "a", "b"]);
	expect(Object.keys(new Sorts([new Sort("first", "DESC"), new Sort("second", "ASC")]).results(all))).toEqual(["a", "b", "d", "c"]);
	expect(Object.keys(new Sorts([new Sort("first", "ASC"), new Sort("second", "DESC")]).results(all))).toEqual(["c", "d", "b", "a"]);
	expect(Object.keys(new Sorts([new Sort("first", "DESC"), new Sort("second", "DESC")]).results(all))).toEqual(["b", "a", "c", "d"]);
	// Two sort orders (but second isn't relevant).
	expect(Object.keys(new Sorts([new Sort("second", "ASC"), new Sort("first", "ASC")]).results(all))).toEqual(["a", "b", "d", "c"]);
	expect(Object.keys(new Sorts([new Sort("second", "DESC"), new Sort("first", "ASC")]).results(all))).toEqual(["c", "d", "b", "a"]);
});
