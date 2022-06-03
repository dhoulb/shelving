import { basics, basic1, basic2, basic3, basic4, basic5, basic6, basic7, basic8, basic9, expectUnorderedKeys, BasicEntity } from "../test/index.js";
import { Filter } from "../index.js";
import { getIDs } from "../util/data.js";

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
	expect(new Filter<BasicEntity>("str", "IS", "aaa").match(basic1)).toBe(true);
	expect(new Filter<BasicEntity>("str", "IS", "aaa").match(basic2)).toBe(false);
	expect(new Filter<BasicEntity>("id", "IS", "basic1").match(basic1)).toBe(true);
	expect(new Filter<BasicEntity>("id", "IS", "basic1").match(basic2)).toBe(false);
	// Filter plain.
	expectUnorderedKeys(new Filter<BasicEntity>("str", "IS", "aaa").transform(basics), ["basic1"]);
	expectUnorderedKeys(new Filter<BasicEntity>("str", "IS", "NOPE").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("num", "IS", 300).transform(basics), ["basic3"]);
	expectUnorderedKeys(new Filter<BasicEntity>("num", "IS", 999999).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("group", "IS", "a").transform(basics), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new Filter<BasicEntity>("group", "IS", "b").transform(basics), ["basic4", "basic5", "basic6"]);
	expectUnorderedKeys(new Filter<BasicEntity>("group", "IS", "c").transform(basics), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("id", "IS", "basic5").transform(basics), ["basic5"]);
});
test("IN", () => {
	// Match array.
	expect(new Filter<BasicEntity>("str", "IN", ["aaa"]).match(basic1)).toBe(true);
	expect(new Filter<BasicEntity>("str", "IN", ["aaa"]).match(basic2)).toBe(false);
	expect(new Filter<BasicEntity>("id", "IN", ["basic1"]).match(basic1)).toBe(true);
	expect(new Filter<BasicEntity>("id", "IN", ["basic1"]).match(basic2)).toBe(false);
});
test("NOT", () => {
	// Match plain.
	expect(new Filter<BasicEntity>("str", "NOT", "aaa").match(basic1)).toBe(false);
	expect(new Filter<BasicEntity>("str", "NOT", "aaa").match(basic2)).toBe(true);
	expect(new Filter<BasicEntity>("id", "NOT", "basic1").match(basic1)).toBe(false);
	expect(new Filter<BasicEntity>("id", "NOT", "basic1").match(basic2)).toBe(true);
	// Filter plain.
	expectUnorderedKeys(new Filter<BasicEntity>("str", "NOT", "aaa").transform(basics), ["basic2", "basic3", "basic4", "basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("group", "NOT", "a").transform(basics), ["basic4", "basic5", "basic6", "basic7", "basic8", "basic9"]);
});
test("OUT", () => {
	// Match array.
	expect(new Filter<BasicEntity>("str", "OUT", ["aaa"]).match(basic1)).toBe(false);
	expect(new Filter<BasicEntity>("str", "OUT", ["aaa"]).match(basic2)).toBe(true);
	expect(new Filter<BasicEntity>("id", "OUT", ["basic1"]).match(basic1)).toBe(false);
	expect(new Filter<BasicEntity>("id", "OUT", ["basic1"]).match(basic2)).toBe(true);
});
test("CONTAINS", () => {
	expectUnorderedKeys(new Filter<BasicEntity>("tags", "CONTAINS", "odd").transform(basics), ["basic1", "basic3", "basic5", "basic7", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("tags", "CONTAINS", "even").transform(basics), ["basic2", "basic4", "basic6", "basic8"]);
	expectUnorderedKeys(new Filter<BasicEntity>("tags", "CONTAINS", "prime").transform(basics), ["basic1", "basic2", "basic3", "basic5", "basic7"]);
	expectUnorderedKeys(new Filter<BasicEntity>("tags", "CONTAINS", "NOPE").transform(basics), []);
});
test("LT", () => {
	expectUnorderedKeys(new Filter<BasicEntity>("num", "LT", 500).transform(basics), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new Filter<BasicEntity>("num", "LT", 0).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("num", "LT", 1000).transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("str", "LT", "ddd").transform(basics), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new Filter<BasicEntity>("str", "LT", "a").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("str", "LT", "zzz").transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("id", "LT", "basic3").transform(basics), ["basic1", "basic2"]);
	expectUnorderedKeys(new Filter<BasicEntity>("id", "LT", "zzzzzz").transform(basics), getIDs(basics));
});
test("LTE", () => {
	expectUnorderedKeys(new Filter<BasicEntity>("num", "LTE", 500).transform(basics), ["basic1", "basic2", "basic3", "basic4", "basic5"]);
	expectUnorderedKeys(new Filter<BasicEntity>("num", "LTE", 0).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("num", "LTE", 1000).transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("str", "LTE", "ddd").transform(basics), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new Filter<BasicEntity>("str", "LTE", "a").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("str", "LTE", "zzz").transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("id", "LTE", "basic3").transform(basics), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new Filter<BasicEntity>("id", "LTE", "zzzzzz").transform(basics), getIDs(basics));
});
test("GT", () => {
	expectUnorderedKeys(new Filter<BasicEntity>("num", "GT", 500).transform(basics), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("num", "GT", 1000).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("num", "GT", 0).transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("str", "GT", "eee").transform(basics), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("str", "GT", "kkk").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("str", "GT", "").transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("id", "GT", "basic7").transform(basics), ["basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("id", "GT", "").transform(basics), getIDs(basics));
});
test("GTE", () => {
	expectUnorderedKeys(new Filter<BasicEntity>("num", "GTE", 500).transform(basics), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("num", "GTE", 1000).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("num", "GTE", 0).transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("str", "GTE", "eee").transform(basics), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("str", "GTE", "kkk").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("str", "GTE", "").transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("id", "GTE", "basic7").transform(basics), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("id", "GTE", "").transform(basics), getIDs(basics));
});
