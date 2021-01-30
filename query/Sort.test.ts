import { Sort } from "./";

const a = { str: "B", num: 3 };
const b = { str: "C", num: 1 };
const c = { str: "A", num: 4 };
const d = { str: "D", num: 2 };
const all = { a, b, c, d };
const allDesc = { d, c, b, a };
const byStr = { c, a, b, d };
const byStrDesc = { d, b, a, c };
const byNum = { b, d, a, c };
const byNumDesc = { c, a, d, b };
const empty = {};

test("Sort", () => {
	// Check initial keys.
	expect(Object.keys(all)).toEqual(["a", "b", "c", "d"]);
	// Sort empty.
	expect(new Sort("str", "asc").results(empty)).toBe(empty);
	// Sort by id (change).
	expect(Object.keys(new Sort("id").results({ b, d, c, a }))).toEqual(["a", "b", "c", "d"]);
	expect(Object.keys(new Sort("id", "asc").results({ b, d, c, a }))).toEqual(["a", "b", "c", "d"]);
	// Sort by id (no change).
	expect(new Sort("id").results(all)).toBe(all);
	expect(new Sort("id", "desc").results(allDesc)).toBe(allDesc);
	expect(new Sort("id", "asc").results(all)).toBe(all);
	expect(new Sort("id", "desc").results(allDesc)).toBe(allDesc);
	// Sort by string (change).
	expect(Object.keys(new Sort("str").results(all))).toEqual(["c", "a", "b", "d"]);
	expect(Object.keys(new Sort("str", "asc").results(all))).toEqual(["c", "a", "b", "d"]);
	expect(Object.keys(new Sort("str", "desc").results(all))).toEqual(["d", "b", "a", "c"]);
	// Sort by string (no change).
	expect(new Sort("str", "asc").results(byStr)).toBe(byStr);
	expect(new Sort("str", "desc").results(byStrDesc)).toBe(byStrDesc);
	// Sort by number (change).
	expect(Object.keys(new Sort("num").results(all))).toEqual(["b", "d", "a", "c"]);
	expect(Object.keys(new Sort("num", "desc").results(all))).toEqual(["c", "a", "d", "b"]);
	// Sort by number (no change).
	expect(new Sort("num", "asc").results(byNum)).toBe(byNum);
	expect(new Sort("num", "desc").results(byNumDesc)).toBe(byNumDesc);
});
