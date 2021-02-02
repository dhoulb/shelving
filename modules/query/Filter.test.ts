import { allBasics } from "../test";
import { Filter } from "./";

const { basic1, basic2, basic3, basic4, basic5, basic6, basic7, basic8, basic9 } = allBasics;

test("is", () => {
	expect(new Filter("str", "is", "aaa").match("basic1", basic1)).toBe(true);
	expect(new Filter("str", "is", "aaa").match("basic2", basic2)).toBe(false);
	expect(new Filter("id", "is", "basic1").match("basic1", basic1)).toBe(true);
	expect(new Filter("id", "is", "basic1").match("basic2", basic2)).toBe(false);
	expect(new Filter("str", "is", "aaa").results(allBasics)).toEqual({ basic1 });
	expect(new Filter("str", "is", "NOPE").results(allBasics)).toEqual({});
	expect(new Filter("num", "is", 300).results(allBasics)).toEqual({ basic3 });
	expect(new Filter("num", "is", 999999).results(allBasics)).toEqual({});
	expect(new Filter("group", "is", "a").results(allBasics)).toEqual({ basic1, basic2, basic3 });
	expect(new Filter("group", "is", "b").results(allBasics)).toEqual({ basic4, basic5, basic6 });
	expect(new Filter("group", "is", "c").results(allBasics)).toEqual({ basic7, basic8, basic9 });
	expect(new Filter("id", "is", "basic5").results(allBasics)).toEqual({ basic5 });
});
test("in", () => {
	expect(new Filter("num", "in", [200, 600, 900, 999999]).results(allBasics)).toEqual({ basic2, basic6, basic9 });
	expect(new Filter("str", "in", ["aaa", "ddd", "eee", "NOPE"]).results(allBasics)).toEqual({ basic1, basic4, basic5 });
	expect(new Filter("num", "in", []).results(allBasics)).toEqual({});
	expect(new Filter("str", "in", []).results(allBasics)).toEqual({});
});
test("contains", () => {
	expect(new Filter("tags", "contains", "odd").results(allBasics)).toEqual({ basic1, basic3, basic5, basic7, basic9 });
	expect(new Filter("tags", "contains", "even").results(allBasics)).toEqual({ basic2, basic4, basic6, basic8 });
	expect(new Filter("tags", "contains", "prime").results(allBasics)).toEqual({ basic1, basic2, basic3, basic5, basic7 });
	expect(new Filter("tags", "contains", "NOPE").results(allBasics)).toEqual({});
});
test("lt", () => {
	expect(new Filter("num", "lt", 500).results(allBasics)).toEqual({ basic1, basic2, basic3, basic4 });
	expect(new Filter("num", "lt", 0).results(allBasics)).toEqual({});
	expect(new Filter("num", "lt", 1000).results(allBasics)).toBe(allBasics);
	expect(new Filter("str", "lt", "ddd").results(allBasics)).toEqual({ basic1, basic2, basic3 });
	expect(new Filter("str", "lt", "a").results(allBasics)).toEqual({});
	expect(new Filter("str", "lt", "zzz").results(allBasics)).toBe(allBasics);
	expect(new Filter("id", "lt", "basic3").results(allBasics)).toEqual({ basic1, basic2 });
	expect(new Filter("id", "lt", "zzzzzz").results(allBasics)).toBe(allBasics);
});
test("lte", () => {
	expect(new Filter("num", "lte", 500).results(allBasics)).toEqual({ basic1, basic2, basic3, basic4, basic5 });
	expect(new Filter("num", "lte", 0).results(allBasics)).toEqual({});
	expect(new Filter("num", "lte", 1000).results(allBasics)).toBe(allBasics);
	expect(new Filter("str", "lte", "ddd").results(allBasics)).toEqual({ basic1, basic2, basic3, basic4 });
	expect(new Filter("str", "lte", "a").results(allBasics)).toEqual({});
	expect(new Filter("str", "lte", "zzz").results(allBasics)).toBe(allBasics);
	expect(new Filter("id", "lte", "basic3").results(allBasics)).toEqual({ basic1, basic2, basic3 });
	expect(new Filter("id", "lte", "zzzzzz").results(allBasics)).toBe(allBasics);
});
test("gt", () => {
	expect(new Filter("num", "gt", 500).results(allBasics)).toEqual({ basic6, basic7, basic8, basic9 });
	expect(new Filter("num", "gt", 1000).results(allBasics)).toEqual({});
	expect(new Filter("num", "gt", 0).results(allBasics)).toBe(allBasics);
	expect(new Filter("str", "gt", "eee").results(allBasics)).toEqual({ basic6, basic7, basic8, basic9 });
	expect(new Filter("str", "gt", "kkk").results(allBasics)).toEqual({});
	expect(new Filter("str", "gt", "").results(allBasics)).toBe(allBasics);
	expect(new Filter("id", "gt", "basic7").results(allBasics)).toEqual({ basic8, basic9 });
	expect(new Filter("id", "gt", "").results(allBasics)).toBe(allBasics);
});
test("gte", () => {
	expect(new Filter("num", "gte", 500).results(allBasics)).toEqual({ basic5, basic6, basic7, basic8, basic9 });
	expect(new Filter("num", "gte", 1000).results(allBasics)).toEqual({});
	expect(new Filter("num", "gte", 0).results(allBasics)).toBe(allBasics);
	expect(new Filter("str", "gte", "eee").results(allBasics)).toEqual({ basic5, basic6, basic7, basic8, basic9 });
	expect(new Filter("str", "gte", "kkk").results(allBasics)).toEqual({});
	expect(new Filter("str", "gte", "").results(allBasics)).toBe(allBasics);
	expect(new Filter("id", "gte", "basic7").results(allBasics)).toEqual({ basic7, basic8, basic9 });
	expect(new Filter("id", "gte", "").results(allBasics)).toBe(allBasics);
});
