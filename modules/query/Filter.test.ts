import { allBasics } from "../test/index.js";
import { Filter } from "../index.js";

const { basic1, basic2, basic3, basic4, basic5, basic6, basic7, basic8, basic9 } = allBasics;

test("is", () => {
	expect(new Filter("str", "IS", "aaa").match("basic1", basic1)).toBe(true);
	expect(new Filter("str", "IS", "aaa").match("basic2", basic2)).toBe(false);
	expect(new Filter("id", "IS", "basic1").match("basic1", basic1)).toBe(true);
	expect(new Filter("id", "IS", "basic1").match("basic2", basic2)).toBe(false);
	expect(new Filter("str", "IS", "aaa").results(allBasics)).toEqual({ basic1 });
	expect(new Filter("str", "IS", "NOPE").results(allBasics)).toEqual({});
	expect(new Filter("num", "IS", 300).results(allBasics)).toEqual({ basic3 });
	expect(new Filter("num", "IS", 999999).results(allBasics)).toEqual({});
	expect(new Filter("group", "IS", "a").results(allBasics)).toEqual({ basic1, basic2, basic3 });
	expect(new Filter("group", "IS", "b").results(allBasics)).toEqual({ basic4, basic5, basic6 });
	expect(new Filter("group", "IS", "c").results(allBasics)).toEqual({ basic7, basic8, basic9 });
	expect(new Filter("id", "IS", "basic5").results(allBasics)).toEqual({ basic5 });
});
test("in", () => {
	expect(new Filter("num", "IN", [200, 600, 900, 999999]).results(allBasics)).toEqual({ basic2, basic6, basic9 });
	expect(new Filter("str", "IN", ["aaa", "ddd", "eee", "NOPE"]).results(allBasics)).toEqual({ basic1, basic4, basic5 });
	expect(new Filter("num", "IN", []).results(allBasics)).toEqual({});
	expect(new Filter("str", "IN", []).results(allBasics)).toEqual({});
});
test("contains", () => {
	expect(new Filter("tags", "CONTAINS", "odd").results(allBasics)).toEqual({ basic1, basic3, basic5, basic7, basic9 });
	expect(new Filter("tags", "CONTAINS", "even").results(allBasics)).toEqual({ basic2, basic4, basic6, basic8 });
	expect(new Filter("tags", "CONTAINS", "prime").results(allBasics)).toEqual({ basic1, basic2, basic3, basic5, basic7 });
	expect(new Filter("tags", "CONTAINS", "NOPE").results(allBasics)).toEqual({});
});
test("lt", () => {
	expect(new Filter("num", "LT", 500).results(allBasics)).toEqual({ basic1, basic2, basic3, basic4 });
	expect(new Filter("num", "LT", 0).results(allBasics)).toEqual({});
	expect(new Filter("num", "LT", 1000).results(allBasics)).toBe(allBasics);
	expect(new Filter("str", "LT", "ddd").results(allBasics)).toEqual({ basic1, basic2, basic3 });
	expect(new Filter("str", "LT", "a").results(allBasics)).toEqual({});
	expect(new Filter("str", "LT", "zzz").results(allBasics)).toBe(allBasics);
	expect(new Filter("id", "LT", "basic3").results(allBasics)).toEqual({ basic1, basic2 });
	expect(new Filter("id", "LT", "zzzzzz").results(allBasics)).toBe(allBasics);
});
test("lte", () => {
	expect(new Filter("num", "LTE", 500).results(allBasics)).toEqual({ basic1, basic2, basic3, basic4, basic5 });
	expect(new Filter("num", "LTE", 0).results(allBasics)).toEqual({});
	expect(new Filter("num", "LTE", 1000).results(allBasics)).toBe(allBasics);
	expect(new Filter("str", "LTE", "ddd").results(allBasics)).toEqual({ basic1, basic2, basic3, basic4 });
	expect(new Filter("str", "LTE", "a").results(allBasics)).toEqual({});
	expect(new Filter("str", "LTE", "zzz").results(allBasics)).toBe(allBasics);
	expect(new Filter("id", "LTE", "basic3").results(allBasics)).toEqual({ basic1, basic2, basic3 });
	expect(new Filter("id", "LTE", "zzzzzz").results(allBasics)).toBe(allBasics);
});
test("gt", () => {
	expect(new Filter("num", "GT", 500).results(allBasics)).toEqual({ basic6, basic7, basic8, basic9 });
	expect(new Filter("num", "GT", 1000).results(allBasics)).toEqual({});
	expect(new Filter("num", "GT", 0).results(allBasics)).toBe(allBasics);
	expect(new Filter("str", "GT", "eee").results(allBasics)).toEqual({ basic6, basic7, basic8, basic9 });
	expect(new Filter("str", "GT", "kkk").results(allBasics)).toEqual({});
	expect(new Filter("str", "GT", "").results(allBasics)).toBe(allBasics);
	expect(new Filter("id", "GT", "basic7").results(allBasics)).toEqual({ basic8, basic9 });
	expect(new Filter("id", "GT", "").results(allBasics)).toBe(allBasics);
});
test("gte", () => {
	expect(new Filter("num", "GTE", 500).results(allBasics)).toEqual({ basic5, basic6, basic7, basic8, basic9 });
	expect(new Filter("num", "GTE", 1000).results(allBasics)).toEqual({});
	expect(new Filter("num", "GTE", 0).results(allBasics)).toBe(allBasics);
	expect(new Filter("str", "GTE", "eee").results(allBasics)).toEqual({ basic5, basic6, basic7, basic8, basic9 });
	expect(new Filter("str", "GTE", "kkk").results(allBasics)).toEqual({});
	expect(new Filter("str", "GTE", "").results(allBasics)).toBe(allBasics);
	expect(new Filter("id", "GTE", "basic7").results(allBasics)).toEqual({ basic7, basic8, basic9 });
	expect(new Filter("id", "GTE", "").results(allBasics)).toBe(allBasics);
});
