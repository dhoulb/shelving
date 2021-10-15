import { Query, Filter, Sort, Filters, Sorts, Slice } from "../index.js";

type T = { str: string; num: number; type: "alpha" | "beta" };
const a: T = { str: "Z", num: 3, type: "alpha" };
const b: T = { str: "Y", num: 1, type: "alpha" };
const c: T = { str: "W", num: 4, type: "beta" };
const d: T = { str: "X", num: 2, type: "beta" };
const all = { a, b, c, d };
const empty = {};

const filterNum = new Filter<T>("num", "GT", 2);
const filterStr = new Filter<T>("str", "IN", ["Z", "X"]);
const filterType = new Filter<T>("type", "IS", "alpha");

const sortIdAsc = new Sort<T>("id", "ASC");
const sortIdDesc = new Sort<T>("id", "DESC");
const sortStrAsc = new Sort<T>("str", "ASC");
const sortStrDesc = new Sort<T>("str", "DESC");
const sortNumAsc = new Sort<T>("num", "ASC");
const sortNumDesc = new Sort<T>("num", "DESC");
const sortTypeAsc = new Sort<T>("type", "ASC");
const sortTypeDesc = new Sort<T>("type", "DESC");

describe("Query", () => {
	test("Basic tests", () => {
		// Empty.
		expect(new Query().results(empty)).toBe(empty);
		expect(new Query(new Filters([filterNum]), new Sorts([sortIdAsc]), new Slice(20)).results(empty)).toBe(empty);
		// Limits.
		expect(new Query(undefined, undefined, new Slice(2)).results(all)).toEqual({ a, b });
		expect(new Query(undefined, undefined, new Slice(3)).results(all)).toEqual({ a, b, c });
		expect(new Query(undefined, undefined, new Slice(0)).results(all)).toEqual({});
	});
	test("Sorting", () => {
		// Creating.
		expect(new Query().asc("id")).toEqual(new Query(undefined, new Sorts([sortIdAsc])));
		// Constructing with sorts.
		expect(Object.keys(new Query(undefined, new Sorts([sortIdAsc])).results({ b, d, c, a }))).toEqual(["a", "b", "c", "d"]);
		expect(Object.keys(new Query(undefined, new Sorts([sortStrAsc])).results({ b, d, c, a }))).toEqual(["c", "d", "b", "a"]);
		expect(Object.keys(new Query(undefined, new Sorts([sortNumDesc])).results({ b, d, c, a }))).toEqual(["c", "a", "d", "b"]);
		expect(Object.keys(new Query(undefined, new Sorts([sortTypeAsc, sortIdAsc])).results({ b, d, c, a }))).toEqual(["a", "b", "c", "d"]);
		expect(Object.keys(new Query(undefined, new Sorts([sortTypeAsc, sortIdDesc])).results({ b, d, c, a }))).toEqual(["b", "a", "d", "c"]);
		expect(Object.keys(new Query(undefined, new Sorts([sortTypeDesc, sortIdAsc])).results({ b, d, c, a }))).toEqual(["c", "d", "a", "b"]);
		expect(Object.keys(new Query(undefined, new Sorts([sortTypeDesc, sortIdDesc])).results({ b, d, c, a }))).toEqual(["d", "c", "b", "a"]);
		// Adding sorts.
		expect(Object.keys(new Query().asc("id").results({ b, d, c, a }))).toEqual(["a", "b", "c", "d"]);
		expect(Object.keys(new Query().asc("str").results({ b, d, c, a }))).toEqual(["c", "d", "b", "a"]);
		expect(Object.keys(new Query().desc("num").results({ b, d, c, a }))).toEqual(["c", "a", "d", "b"]);
		expect(Object.keys(new Query().asc("type").asc("id").results({ b, d, c, a }))).toEqual(["a", "b", "c", "d"]);
		expect(Object.keys(new Query().asc("type").desc("id").results({ b, d, c, a }))).toEqual(["b", "a", "d", "c"]);
		expect(Object.keys(new Query().desc("type").asc("id").results({ b, d, c, a }))).toEqual(["c", "d", "a", "b"]);
		expect(Object.keys(new Query().desc("type").desc("id").results({ b, d, c, a }))).toEqual(["d", "c", "b", "a"]);
	});
	test("Filtering", () => {
		// Creating.
		expect(new Query().is("id", "abc")).toEqual(new Query(new Filters([new Filter("id", "IS", "abc")])));
		// Constructing with filtering.
		expect(new Query(new Filters([filterNum])).results(all)).toEqual({ a, c });
		expect(new Query(new Filters([filterStr])).results(all)).toEqual({ a, d });
		expect(new Query(new Filters([filterType])).results(all)).toEqual({ a, b });
		// Adding filters.
		expect(new Query().gt("num", 2).results(all)).toEqual({ a, c });
		expect(new Query().in("str", ["X", "Z"]).results(all)).toEqual({ a, d });
		expect(new Query().is("type", "beta").results(all)).toEqual({ c, d });
		expect(new Query().gt("num", 2).is("str", "W").results(all)).toEqual({ c });
		expect(new Query().is("type", "beta").lte("num", 2).results(all)).toEqual({ d });
		expect(new Query().in("str", ["X", "Y", "Z"]).is("type", "alpha").results(all)).toEqual({ a, b });
	});
	test("Slicing", () => {
		// Creating.
		expect(new Query().limit(5)).toEqual(new Query(undefined, undefined, new Slice(5)));
		expect(new Query().limit(null)).toEqual(new Query(undefined, undefined, new Slice(null)));
		// Constructing with slicing.
		expect(new Query(undefined, undefined, new Slice(4)).results(all)).toBe(all);
		expect(new Query(undefined, undefined, new Slice(3)).results(all)).toEqual({ a, b, c });
		expect(new Query(undefined, undefined, new Slice(2)).results(all)).toEqual({ a, b });
		expect(new Query(undefined, undefined, new Slice(1)).results(all)).toEqual({ a });
		expect(new Query(undefined, undefined, new Slice(0)).results(all)).toEqual({});
		// Adding slicing.
		expect(new Query().limit(4).results(all)).toBe(all);
		expect(new Query().limit(3).results(all)).toEqual({ a, b, c });
		expect(new Query().limit(2).results(all)).toEqual({ a, b });
		expect(new Query().limit(1).results(all)).toEqual({ a });
		expect(new Query().limit(0).results(all)).toEqual({});
	});
	test("Combined tests", () => {
		// Full queries.
		expect(Object.keys(new Query(new Filters([filterNum]), new Sorts([sortNumAsc])).results(all))).toEqual(["a", "c"]);
		expect(Object.keys(new Query(new Filters([filterNum]), new Sorts([sortNumDesc])).results(all))).toEqual(["c", "a"]);
		expect(Object.keys(new Query(new Filters([filterNum]), new Sorts([sortIdAsc])).results(all))).toEqual(["a", "c"]);
		expect(Object.keys(new Query(new Filters([filterNum]), new Sorts([sortIdDesc])).results(all))).toEqual(["c", "a"]);
		expect(Object.keys(new Query(new Filters([filterNum]), new Sorts([sortNumAsc]), new Slice(1)).results(all))).toEqual(["a"]);
		expect(Object.keys(new Query(new Filters([filterNum]), new Sorts([sortNumDesc]), new Slice(1)).results(all))).toEqual(["c"]);
		expect(Object.keys(new Query(new Filters([filterNum]), new Sorts([sortIdAsc]), new Slice(1)).results(all))).toEqual(["a"]);
		expect(Object.keys(new Query(new Filters([filterNum]), new Sorts([sortIdDesc]), new Slice(1)).results(all))).toEqual(["c"]);
		expect(Object.keys(new Query(new Filters([filterStr]), new Sorts([sortIdAsc])).results(all))).toEqual(["a", "d"]);
		expect(Object.keys(new Query(new Filters([filterStr]), new Sorts([sortIdDesc])).results(all))).toEqual(["d", "a"]);
		expect(Object.keys(new Query(new Filters([filterType]), new Sorts([sortStrAsc])).results(all))).toEqual(["b", "a"]);
		expect(Object.keys(new Query(new Filters([filterType]), new Sorts([sortStrDesc])).results(all))).toEqual(["a", "b"]);
		expect(Object.keys(new Query(new Filters([filterStr]), new Sorts([sortIdAsc]), new Slice(1)).results(all))).toEqual(["a"]);
		expect(Object.keys(new Query(new Filters([filterStr]), new Sorts([sortIdDesc]), new Slice(1)).results(all))).toEqual(["d"]);
		expect(Object.keys(new Query(new Filters([filterType]), new Sorts([sortStrAsc]), new Slice(1)).results(all))).toEqual(["b"]);
		expect(Object.keys(new Query(new Filters([filterType]), new Sorts([sortStrDesc]), new Slice(1)).results(all))).toEqual(["a"]);
	});
});
