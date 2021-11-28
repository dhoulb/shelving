import { basicResults, basic1, basic2, basic3, basic4, basic5, basic6, basic7, basic8, basic9, expectUnorderedKeys } from "../test/index.js";
import { EqualFilter, InArrayFilter, ArrayContainsFilter, LessThanFilter, LessThanEqualFilter, GreaterThanFilter, GreaterThanEqualFilter } from "../index.js";

test("EqualFilter", () => {
	expect(new EqualFilter("str", "aaa").match(["basic1", basic1])).toBe(true);
	expect(new EqualFilter("str", "aaa").match(["basic2", basic2])).toBe(false);
	expect(new EqualFilter("id", "basic1").match(["basic1", basic1])).toBe(true);
	expect(new EqualFilter("id", "basic1").match(["basic2", basic2])).toBe(false);
	expectUnorderedKeys(new EqualFilter("str", "aaa").derive(basicResults), ["basic1"]);
	expectUnorderedKeys(new EqualFilter("str", "NOPE").derive(basicResults), []);
	expectUnorderedKeys(new EqualFilter("num", 300).derive(basicResults), ["basic3"]);
	expectUnorderedKeys(new EqualFilter("num", 999999).derive(basicResults), []);
	expectUnorderedKeys(new EqualFilter("group", "a").derive(basicResults), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new EqualFilter("group", "b").derive(basicResults), ["basic4", "basic5", "basic6"]);
	expectUnorderedKeys(new EqualFilter("group", "c").derive(basicResults), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new EqualFilter("id", "basic5").derive(basicResults), ["basic5"]);
});
test("InArrayFilter", () => {
	expectUnorderedKeys(new InArrayFilter("num", [200, 600, 900, 999999]).derive(basicResults), ["basic2", "basic6", "basic9"]);
	expectUnorderedKeys(new InArrayFilter("str", ["aaa", "ddd", "eee", "NOPE"]).derive(basicResults), ["basic1", "basic4", "basic5"]);
	expectUnorderedKeys(new InArrayFilter("num", []).derive(basicResults), []);
	expectUnorderedKeys(new InArrayFilter("str", []).derive(basicResults), []);
});
test("ArrayContainsFilter", () => {
	expectUnorderedKeys(new ArrayContainsFilter("tags", "odd").derive(basicResults), ["basic1", "basic3", "basic5", "basic7", "basic9"]);
	expectUnorderedKeys(new ArrayContainsFilter("tags", "even").derive(basicResults), ["basic2", "basic4", "basic6", "basic8"]);
	expectUnorderedKeys(new ArrayContainsFilter("tags", "prime").derive(basicResults), ["basic1", "basic2", "basic3", "basic5", "basic7"]);
	expectUnorderedKeys(new ArrayContainsFilter("tags", "NOPE").derive(basicResults), []);
});
test("LessThanFilter", () => {
	expectUnorderedKeys(new LessThanFilter("num", 500).derive(basicResults), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new LessThanFilter("num", 0).derive(basicResults), []);
	expectUnorderedKeys(new LessThanFilter("num", 1000).derive(basicResults), basicResults.keys());
	expectUnorderedKeys(new LessThanFilter("str", "ddd").derive(basicResults), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new LessThanFilter("str", "a").derive(basicResults), []);
	expectUnorderedKeys(new LessThanFilter("str", "zzz").derive(basicResults), basicResults.keys());
	expectUnorderedKeys(new LessThanFilter("id", "basic3").derive(basicResults), ["basic1", "basic2"]);
	expectUnorderedKeys(new LessThanFilter("id", "zzzzzz").derive(basicResults), basicResults.keys());
});
test("LessThanEqualFilter", () => {
	expectUnorderedKeys(new LessThanEqualFilter("num", 500).derive(basicResults), ["basic1", "basic2", "basic3", "basic4", "basic5"]);
	expectUnorderedKeys(new LessThanEqualFilter("num", 0).derive(basicResults), []);
	expectUnorderedKeys(new LessThanEqualFilter("num", 1000).derive(basicResults), basicResults.keys());
	expectUnorderedKeys(new LessThanEqualFilter("str", "ddd").derive(basicResults), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new LessThanEqualFilter("str", "a").derive(basicResults), []);
	expectUnorderedKeys(new LessThanEqualFilter("str", "zzz").derive(basicResults), basicResults.keys());
	expectUnorderedKeys(new LessThanEqualFilter("id", "basic3").derive(basicResults), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new LessThanEqualFilter("id", "zzzzzz").derive(basicResults), basicResults.keys());
});
test("GreaterThanFilter", () => {
	expectUnorderedKeys(new GreaterThanFilter("num", 500).derive(basicResults), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new GreaterThanFilter("num", 1000).derive(basicResults), []);
	expectUnorderedKeys(new GreaterThanFilter("num", 0).derive(basicResults), basicResults.keys());
	expectUnorderedKeys(new GreaterThanFilter("str", "eee").derive(basicResults), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new GreaterThanFilter("str", "kkk").derive(basicResults), []);
	expectUnorderedKeys(new GreaterThanFilter("str", "").derive(basicResults), basicResults.keys());
	expectUnorderedKeys(new GreaterThanFilter("id", "basic7").derive(basicResults), ["basic8", "basic9"]);
	expectUnorderedKeys(new GreaterThanFilter("id", "").derive(basicResults), basicResults.keys());
});
test("GreaterThanEqualFilter", () => {
	expectUnorderedKeys(new GreaterThanEqualFilter("num", 500).derive(basicResults), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new GreaterThanEqualFilter("num", 1000).derive(basicResults), []);
	expectUnorderedKeys(new GreaterThanEqualFilter("num", 0).derive(basicResults), basicResults.keys());
	expectUnorderedKeys(new GreaterThanEqualFilter("str", "eee").derive(basicResults), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new GreaterThanEqualFilter("str", "kkk").derive(basicResults), []);
	expectUnorderedKeys(new GreaterThanEqualFilter("str", "").derive(basicResults), basicResults.keys());
	expectUnorderedKeys(new GreaterThanEqualFilter("id", "basic7").derive(basicResults), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new GreaterThanEqualFilter("id", "").derive(basicResults), basicResults.keys());
});
