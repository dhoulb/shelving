import { allBasics } from "../test/index.js";
import { Filter } from "../index.js";

const { basic1, basic2, basic3, basic4, basic5, basic6, basic7, basic8, basic9 } = allBasics;

test("is", () => {
	expect(new Filter("str", "IS", "aaa").match("basic1", basic1)).toBe(true);
	expect(new Filter("str", "IS", "aaa").match("basic2", basic2)).toBe(false);
	expect(new Filter("id", "IS", "basic1").match("basic1", basic1)).toBe(true);
	expect(new Filter("id", "IS", "basic1").match("basic2", basic2)).toBe(false);
	expect(new Filter("str", "IS", "aaa").queryResults(allBasics)).toEqual({ basic1 });
	expect(new Filter("str", "IS", "NOPE").queryResults(allBasics)).toEqual({});
	expect(new Filter("num", "IS", 300).queryResults(allBasics)).toEqual({ basic3 });
	expect(new Filter("num", "IS", 999999).queryResults(allBasics)).toEqual({});
	expect(new Filter("group", "IS", "a").queryResults(allBasics)).toEqual({ basic1, basic2, basic3 });
	expect(new Filter("group", "IS", "b").queryResults(allBasics)).toEqual({ basic4, basic5, basic6 });
	expect(new Filter("group", "IS", "c").queryResults(allBasics)).toEqual({ basic7, basic8, basic9 });
	expect(new Filter("id", "IS", "basic5").queryResults(allBasics)).toEqual({ basic5 });
});
test("in", () => {
	expect(new Filter("num", "IN", [200, 600, 900, 999999]).queryResults(allBasics)).toEqual({ basic2, basic6, basic9 });
	expect(new Filter("str", "IN", ["aaa", "ddd", "eee", "NOPE"]).queryResults(allBasics)).toEqual({ basic1, basic4, basic5 });
	expect(new Filter("num", "IN", []).queryResults(allBasics)).toEqual({});
	expect(new Filter("str", "IN", []).queryResults(allBasics)).toEqual({});
});
test("contains", () => {
	expect(new Filter("tags", "CONTAINS", "odd").queryResults(allBasics)).toEqual({ basic1, basic3, basic5, basic7, basic9 });
	expect(new Filter("tags", "CONTAINS", "even").queryResults(allBasics)).toEqual({ basic2, basic4, basic6, basic8 });
	expect(new Filter("tags", "CONTAINS", "prime").queryResults(allBasics)).toEqual({ basic1, basic2, basic3, basic5, basic7 });
	expect(new Filter("tags", "CONTAINS", "NOPE").queryResults(allBasics)).toEqual({});
});
test("lt", () => {
	expect(new Filter("num", "LT", 500).queryResults(allBasics)).toEqual({ basic1, basic2, basic3, basic4 });
	expect(new Filter("num", "LT", 0).queryResults(allBasics)).toEqual({});
	expect(new Filter("num", "LT", 1000).queryResults(allBasics)).toBe(allBasics);
	expect(new Filter("str", "LT", "ddd").queryResults(allBasics)).toEqual({ basic1, basic2, basic3 });
	expect(new Filter("str", "LT", "a").queryResults(allBasics)).toEqual({});
	expect(new Filter("str", "LT", "zzz").queryResults(allBasics)).toBe(allBasics);
	expect(new Filter("id", "LT", "basic3").queryResults(allBasics)).toEqual({ basic1, basic2 });
	expect(new Filter("id", "LT", "zzzzzz").queryResults(allBasics)).toBe(allBasics);
});
test("lte", () => {
	expect(new Filter("num", "LTE", 500).queryResults(allBasics)).toEqual({ basic1, basic2, basic3, basic4, basic5 });
	expect(new Filter("num", "LTE", 0).queryResults(allBasics)).toEqual({});
	expect(new Filter("num", "LTE", 1000).queryResults(allBasics)).toBe(allBasics);
	expect(new Filter("str", "LTE", "ddd").queryResults(allBasics)).toEqual({ basic1, basic2, basic3, basic4 });
	expect(new Filter("str", "LTE", "a").queryResults(allBasics)).toEqual({});
	expect(new Filter("str", "LTE", "zzz").queryResults(allBasics)).toBe(allBasics);
	expect(new Filter("id", "LTE", "basic3").queryResults(allBasics)).toEqual({ basic1, basic2, basic3 });
	expect(new Filter("id", "LTE", "zzzzzz").queryResults(allBasics)).toBe(allBasics);
});
test("gt", () => {
	expect(new Filter("num", "GT", 500).queryResults(allBasics)).toEqual({ basic6, basic7, basic8, basic9 });
	expect(new Filter("num", "GT", 1000).queryResults(allBasics)).toEqual({});
	expect(new Filter("num", "GT", 0).queryResults(allBasics)).toBe(allBasics);
	expect(new Filter("str", "GT", "eee").queryResults(allBasics)).toEqual({ basic6, basic7, basic8, basic9 });
	expect(new Filter("str", "GT", "kkk").queryResults(allBasics)).toEqual({});
	expect(new Filter("str", "GT", "").queryResults(allBasics)).toBe(allBasics);
	expect(new Filter("id", "GT", "basic7").queryResults(allBasics)).toEqual({ basic8, basic9 });
	expect(new Filter("id", "GT", "").queryResults(allBasics)).toBe(allBasics);
});
test("gte", () => {
	expect(new Filter("num", "GTE", 500).queryResults(allBasics)).toEqual({ basic5, basic6, basic7, basic8, basic9 });
	expect(new Filter("num", "GTE", 1000).queryResults(allBasics)).toEqual({});
	expect(new Filter("num", "GTE", 0).queryResults(allBasics)).toBe(allBasics);
	expect(new Filter("str", "GTE", "eee").queryResults(allBasics)).toEqual({ basic5, basic6, basic7, basic8, basic9 });
	expect(new Filter("str", "GTE", "kkk").queryResults(allBasics)).toEqual({});
	expect(new Filter("str", "GTE", "").queryResults(allBasics)).toBe(allBasics);
	expect(new Filter("id", "GTE", "basic7").queryResults(allBasics)).toEqual({ basic7, basic8, basic9 });
	expect(new Filter("id", "GTE", "").queryResults(allBasics)).toBe(allBasics);
});
