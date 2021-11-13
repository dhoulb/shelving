import { Sort } from "../index.js";

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
	expect(new Sort("str", "ASC").queryResults(empty)).toBe(empty);
	// Sort by id (change).
	expect(Object.keys(new Sort("id").queryResults({ b, d, c, a }))).toEqual(["a", "b", "c", "d"]);
	expect(Object.keys(new Sort("id", "ASC").queryResults({ b, d, c, a }))).toEqual(["a", "b", "c", "d"]);
	// Sort by id (no change).
	expect(new Sort("id").queryResults(all)).toBe(all);
	expect(new Sort("id", "DESC").queryResults(allDesc)).toBe(allDesc);
	expect(new Sort("id", "ASC").queryResults(all)).toBe(all);
	expect(new Sort("id", "DESC").queryResults(allDesc)).toBe(allDesc);
	// Sort by string (change).
	expect(Object.keys(new Sort("str").queryResults(all))).toEqual(["c", "a", "b", "d"]);
	expect(Object.keys(new Sort("str", "ASC").queryResults(all))).toEqual(["c", "a", "b", "d"]);
	expect(Object.keys(new Sort("str", "DESC").queryResults(all))).toEqual(["d", "b", "a", "c"]);
	// Sort by string (no change).
	expect(new Sort("str", "ASC").queryResults(byStr)).toBe(byStr);
	expect(new Sort("str", "DESC").queryResults(byStrDesc)).toBe(byStrDesc);
	// Sort by number (change).
	expect(Object.keys(new Sort("num").queryResults(all))).toEqual(["b", "d", "a", "c"]);
	expect(Object.keys(new Sort("num", "DESC").queryResults(all))).toEqual(["c", "a", "d", "b"]);
	// Sort by number (no change).
	expect(new Sort("num", "ASC").queryResults(byNum)).toBe(byNum);
	expect(new Sort("num", "DESC").queryResults(byNumDesc)).toBe(byNumDesc);
});
