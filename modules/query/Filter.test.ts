import { basicResults, basic1, basic2, basic3, basic4, basic5, basic6, basic7, basic8, basic9, expectUnorderedKeys } from "../test/index.js";
import { Filter } from "../index.js";

test("Filter.on()", () => {
	expect(Filter.on("a", 1)).toEqual(new Filter("a", "IS", 1));
	expect(Filter.on("!a", 1)).toEqual(new Filter("a", "NOT", 1));
	expect(Filter.on("a", [1])).toEqual(new Filter("a", "IN", [1]));
	expect(Filter.on("!a", [1])).toEqual(new Filter("a", "OUT", [1]));
	expect(Filter.on("a[]", 1)).toEqual(new Filter("a", "CONTAINS", 1));
	expect(Filter.on("a>", 1)).toEqual(new Filter("a", "GT", 1));
	expect(Filter.on("a>=", 1)).toEqual(new Filter("a", "GTE", 1));
	expect(Filter.on("a<", 1)).toEqual(new Filter("a", "LT", 1));
	expect(Filter.on("a<=", 1)).toEqual(new Filter("a", "LTE", 1));
});
test("IS", () => {
	// Match plain.
	expect(new Filter("str", "IS", "aaa").match(["basic1", basic1])).toBe(true);
	expect(new Filter("str", "IS", "aaa").match(["basic2", basic2])).toBe(false);
	expect(new Filter("id", "IS", "basic1").match(["basic1", basic1])).toBe(true);
	expect(new Filter("id", "IS", "basic1").match(["basic2", basic2])).toBe(false);
	// Filter plain.
	expectUnorderedKeys(new Filter("str", "IS", "aaa").transform(basicResults), ["basic1"]);
	expectUnorderedKeys(new Filter("str", "IS", "NOPE").transform(basicResults), []);
	expectUnorderedKeys(new Filter("num", "IS", 300).transform(basicResults), ["basic3"]);
	expectUnorderedKeys(new Filter("num", "IS", 999999).transform(basicResults), []);
	expectUnorderedKeys(new Filter("group", "IS", "a").transform(basicResults), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new Filter("group", "IS", "b").transform(basicResults), ["basic4", "basic5", "basic6"]);
	expectUnorderedKeys(new Filter("group", "IS", "c").transform(basicResults), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter("id", "IS", "basic5").transform(basicResults), ["basic5"]);
});
test("IN", () => {
	// Match array.
	expect(new Filter("str", "IN", ["aaa"]).match(["basic1", basic1])).toBe(true);
	expect(new Filter("str", "IN", ["aaa"]).match(["basic2", basic2])).toBe(false);
	expect(new Filter("id", "IN", ["basic1"]).match(["basic1", basic1])).toBe(true);
	expect(new Filter("id", "IN", ["basic1"]).match(["basic2", basic2])).toBe(false);
});
test("NOT", () => {
	// Match plain.
	expect(new Filter("str", "NOT", "aaa").match(["basic1", basic1])).toBe(false);
	expect(new Filter("str", "NOT", "aaa").match(["basic2", basic2])).toBe(true);
	expect(new Filter("id", "NOT", "basic1").match(["basic1", basic1])).toBe(false);
	expect(new Filter("id", "NOT", "basic1").match(["basic2", basic2])).toBe(true);
	// Filter plain.
	expectUnorderedKeys(new Filter("str", "NOT", "aaa").transform(basicResults), ["basic2", "basic3", "basic4", "basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter("group", "NOT", "a").transform(basicResults), ["basic4", "basic5", "basic6", "basic7", "basic8", "basic9"]);
});
test("OUT", () => {
	// Match array.
	expect(new Filter("str", "OUT", ["aaa"]).match(["basic1", basic1])).toBe(false);
	expect(new Filter("str", "OUT", ["aaa"]).match(["basic2", basic2])).toBe(true);
	expect(new Filter("id", "OUT", ["basic1"]).match(["basic1", basic1])).toBe(false);
	expect(new Filter("id", "OUT", ["basic1"]).match(["basic2", basic2])).toBe(true);
});
test("CONTAINS", () => {
	expectUnorderedKeys(new Filter("tags", "CONTAINS", "odd").transform(basicResults), ["basic1", "basic3", "basic5", "basic7", "basic9"]);
	expectUnorderedKeys(new Filter("tags", "CONTAINS", "even").transform(basicResults), ["basic2", "basic4", "basic6", "basic8"]);
	expectUnorderedKeys(new Filter("tags", "CONTAINS", "prime").transform(basicResults), ["basic1", "basic2", "basic3", "basic5", "basic7"]);
	expectUnorderedKeys(new Filter("tags", "CONTAINS", "NOPE").transform(basicResults), []);
});
test("LT", () => {
	expectUnorderedKeys(new Filter("num", "LT", 500).transform(basicResults), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new Filter("num", "LT", 0).transform(basicResults), []);
	expectUnorderedKeys(new Filter("num", "LT", 1000).transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new Filter("str", "LT", "ddd").transform(basicResults), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new Filter("str", "LT", "a").transform(basicResults), []);
	expectUnorderedKeys(new Filter("str", "LT", "zzz").transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new Filter("id", "LT", "basic3").transform(basicResults), ["basic1", "basic2"]);
	expectUnorderedKeys(new Filter("id", "LT", "zzzzzz").transform(basicResults), basicResults.keys());
});
test("LTE", () => {
	expectUnorderedKeys(new Filter("num", "LTE", 500).transform(basicResults), ["basic1", "basic2", "basic3", "basic4", "basic5"]);
	expectUnorderedKeys(new Filter("num", "LTE", 0).transform(basicResults), []);
	expectUnorderedKeys(new Filter("num", "LTE", 1000).transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new Filter("str", "LTE", "ddd").transform(basicResults), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new Filter("str", "LTE", "a").transform(basicResults), []);
	expectUnorderedKeys(new Filter("str", "LTE", "zzz").transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new Filter("id", "LTE", "basic3").transform(basicResults), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new Filter("id", "LTE", "zzzzzz").transform(basicResults), basicResults.keys());
});
test("GT", () => {
	expectUnorderedKeys(new Filter("num", "GT", 500).transform(basicResults), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter("num", "GT", 1000).transform(basicResults), []);
	expectUnorderedKeys(new Filter("num", "GT", 0).transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new Filter("str", "GT", "eee").transform(basicResults), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter("str", "GT", "kkk").transform(basicResults), []);
	expectUnorderedKeys(new Filter("str", "GT", "").transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new Filter("id", "GT", "basic7").transform(basicResults), ["basic8", "basic9"]);
	expectUnorderedKeys(new Filter("id", "GT", "").transform(basicResults), basicResults.keys());
});
test("GTE", () => {
	expectUnorderedKeys(new Filter("num", "GTE", 500).transform(basicResults), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter("num", "GTE", 1000).transform(basicResults), []);
	expectUnorderedKeys(new Filter("num", "GTE", 0).transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new Filter("str", "GTE", "eee").transform(basicResults), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter("str", "GTE", "kkk").transform(basicResults), []);
	expectUnorderedKeys(new Filter("str", "GTE", "").transform(basicResults), basicResults.keys());
	expectUnorderedKeys(new Filter("id", "GTE", "basic7").transform(basicResults), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter("id", "GTE", "").transform(basicResults), basicResults.keys());
});
