import { Slice } from "..";

const a = { str: "Z", num: 3, type: "alpha" };
const b = { str: "Y", num: 1, type: "alpha" };
const c = { str: "W", num: 4, type: "beta" };
const d = { str: "X", num: 2, type: "beta" };
const all = { a, b, c, d };
const empty = {};

test("Slice", () => {
	// Empty.
	expect(new Slice(2).results(empty)).toBe(empty);
	// Slices.
	expect(new Slice(2).results(all)).toEqual({ a, b });
	expect(new Slice(3).results(all)).toEqual({ a, b, c });
	expect(new Slice(0).results(all)).toEqual({});
});
