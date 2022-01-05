import { basicResults, basic1, basic2, basic3, basic4, basic5, basic6, basic7, basic8, basic9, expectUnorderedKeys } from "../test/index.js";
import { EqualFilter, InArrayFilter, ArrayWithFilter, LessFilter, EqualLessFilter, GreaterFilter, EqualGreaterFilter } from "../index.js";

test("EqualFilter", () => {
	expect(new EqualFilter("str", "aaa").match(["basic1", basic1])).toBe(true);
	expect(new EqualFilter("str", "aaa").match(["basic2", basic2])).toBe(false);
	expect(new EqualFilter("id", "basic1").match(["basic1", basic1])).toBe(true);
	expect(new EqualFilter("id", "basic1").match(["basic2", basic2])).toBe(false);
	expectUnorderedKeys(new EqualFilter("str", "aaa").transform(basicResults), ["basic1"]);
	expectUnorderedKeys(new EqualFilter("str", "NOPE").transform(basicResults), []);
	expectUnorderedKeys(new EqualFilter("num", 300).transform(basicResults), ["basic3"]);
	expectUnorderedKeys(new EqualFilter("num", 999999).transform(basicResults), []);
	expectUnorderedKeys(new EqualFilter("group", "a").transform(basicResults), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new EqualFilter("group", "b").transform(basicResults), ["basic4", "basic5", "basic6"]);
	expectUnorderedKeys(new EqualFilter("group", "c").transform(basicResults), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new EqualFilter("id", "basic5").transform(basicResults), ["basic5"]);
});
test("InArrayFilter", () => {
	expectUnorderedKeys(new InArrayFilter("num", [200, 600, 900, 999999]).transform(basicResults), ["basic2", "basic6", "basic9"]);
	expectUnorderedKeys(new InArrayFilter("str", ["aaa", "ddd", "eee", "NOPE"]).transform(basicResults), ["basic1", "basic4", "basic5"]);
	expectUnorderedKeys(new InArrayFilter("num", []).transform(basicResults), []);
	expectUnorderedKeys(new InArrayFilter("str", []).transform(basicResults), []);
});
test("ArrayContainsFilter", () => {
	expectUnorderedKeys(new ArrayWithFilter("tags", "odd").transform(basicResults), ["basic1", "basic3", "basic5", "basic7", "basic9"]);
	expectUnorderedKeys(new ArrayWithFilter("tags", "even").transform(basicResults), ["basic2", "basic4", "basic6", "basic8"]);
	expectUnorderedKeys(new ArrayWithFilter("tags", "prime").transform(basicResults), ["basic1", "basic2", "basic3", "basic5", "basic7"]);
	expectUnorderedKeys(new ArrayWithFilter("tags", "NOPE").transform(basicResults), []);
});
test("LessThanFilter", () => {
	expectUnorderedKeys(new LessFilter("num", 500).transform(basicResults), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new LessFilter("num", 0).transform(basicResults), []);
	expectUnorderedKeys(new LessFilter("num", 1000).transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new LessFilter("str", "ddd").transform(basicResults), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new LessFilter("str", "a").transform(basicResults), []);
	expectUnorderedKeys(new LessFilter("str", "zzz").transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new LessFilter("id", "basic3").transform(basicResults), ["basic1", "basic2"]);
	expectUnorderedKeys(new LessFilter("id", "zzzzzz").transform(basicResults), basicResults.keys());
});
test("LessThanEqualFilter", () => {
	expectUnorderedKeys(new EqualLessFilter("num", 500).transform(basicResults), ["basic1", "basic2", "basic3", "basic4", "basic5"]);
	expectUnorderedKeys(new EqualLessFilter("num", 0).transform(basicResults), []);
	expectUnorderedKeys(new EqualLessFilter("num", 1000).transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new EqualLessFilter("str", "ddd").transform(basicResults), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new EqualLessFilter("str", "a").transform(basicResults), []);
	expectUnorderedKeys(new EqualLessFilter("str", "zzz").transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new EqualLessFilter("id", "basic3").transform(basicResults), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new EqualLessFilter("id", "zzzzzz").transform(basicResults), basicResults.keys());
});
test("GreaterThanFilter", () => {
	expectUnorderedKeys(new GreaterFilter("num", 500).transform(basicResults), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new GreaterFilter("num", 1000).transform(basicResults), []);
	expectUnorderedKeys(new GreaterFilter("num", 0).transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new GreaterFilter("str", "eee").transform(basicResults), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new GreaterFilter("str", "kkk").transform(basicResults), []);
	expectUnorderedKeys(new GreaterFilter("str", "").transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new GreaterFilter("id", "basic7").transform(basicResults), ["basic8", "basic9"]);
	expectUnorderedKeys(new GreaterFilter("id", "").transform(basicResults), basicResults.keys());
});
test("GreaterThanEqualFilter", () => {
	expectUnorderedKeys(new EqualGreaterFilter("num", 500).transform(basicResults), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new EqualGreaterFilter("num", 1000).transform(basicResults), []);
	expectUnorderedKeys(new EqualGreaterFilter("num", 0).transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new EqualGreaterFilter("str", "eee").transform(basicResults), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new EqualGreaterFilter("str", "kkk").transform(basicResults), []);
	expectUnorderedKeys(new EqualGreaterFilter("str", "").transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new EqualGreaterFilter("id", "basic7").transform(basicResults), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new EqualGreaterFilter("id", "").transform(basicResults), basicResults.keys());
});
