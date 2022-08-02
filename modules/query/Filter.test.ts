import { basics, basic1, basic2, basic3, basic4, basic5, basic6, basic7, basic8, basic9, expectUnorderedKeys, BasicEntity } from "../test/index.js";
import { Filter } from "../index.js";
import { getIDs } from "../util/data.js";

test("new Filter()", () => {
	expect(new Filter("a", 1)).toMatchObject({ key: "a", operator: "IS", value: 1 });
	expect(new Filter("!a", 1)).toMatchObject({ key: "a", operator: "NOT", value: 1 });
	expect(new Filter("a", [1])).toMatchObject({ key: "a", operator: "IN", value: [1] });
	expect(new Filter("!a", [1])).toMatchObject({ key: "a", operator: "OUT", value: [1] });
	expect(new Filter("a[]", 1)).toMatchObject({ key: "a", operator: "CONTAINS", value: 1 });
	expect(new Filter("a>", 1)).toMatchObject({ key: "a", operator: "GT", value: 1 });
	expect(new Filter("a>=", 1)).toMatchObject({ key: "a", operator: "GTE", value: 1 });
	expect(new Filter("a<", 1)).toMatchObject({ key: "a", operator: "LT", value: 1 });
	expect(new Filter("a<=", 1)).toMatchObject({ key: "a", operator: "LTE", value: 1 });
});
test("IS", () => {
	// Match plain.
	expect(new Filter<BasicEntity>("str", "aaa").match(basic1)).toBe(true);
	expect(new Filter<BasicEntity>("str", "aaa").match(basic2)).toBe(false);
	expect(new Filter<BasicEntity>("id", "basic1").match(basic1)).toBe(true);
	expect(new Filter<BasicEntity>("id", "basic1").match(basic2)).toBe(false);
	// Filter plain.
	expectUnorderedKeys(new Filter<BasicEntity>("str", "aaa").transform(basics), ["basic1"]);
	expectUnorderedKeys(new Filter<BasicEntity>("str", "NOPE").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("num", 300).transform(basics), ["basic3"]);
	expectUnorderedKeys(new Filter<BasicEntity>("num", 999999).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("group", "a").transform(basics), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new Filter<BasicEntity>("group", "b").transform(basics), ["basic4", "basic5", "basic6"]);
	expectUnorderedKeys(new Filter<BasicEntity>("group", "c").transform(basics), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("id", "basic5").transform(basics), ["basic5"]);
});
test("IN", () => {
	// Match array.
	expect(new Filter<BasicEntity>("str", ["aaa"]).match(basic1)).toBe(true);
	expect(new Filter<BasicEntity>("str", ["aaa"]).match(basic2)).toBe(false);
	expect(new Filter<BasicEntity>("id", ["basic1"]).match(basic1)).toBe(true);
	expect(new Filter<BasicEntity>("id", ["basic1"]).match(basic2)).toBe(false);
});
test("NOT", () => {
	// Match plain.
	expect(new Filter<BasicEntity>("!str", "aaa").match(basic1)).toBe(false);
	expect(new Filter<BasicEntity>("!str", "aaa").match(basic2)).toBe(true);
	expect(new Filter<BasicEntity>("!id", "basic1").match(basic1)).toBe(false);
	expect(new Filter<BasicEntity>("!id", "basic1").match(basic2)).toBe(true);
	// Filter plain.
	expectUnorderedKeys(new Filter<BasicEntity>("!str", "aaa").transform(basics), ["basic2", "basic3", "basic4", "basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("!group", "a").transform(basics), ["basic4", "basic5", "basic6", "basic7", "basic8", "basic9"]);
});
test("OUT", () => {
	// Match array.
	expect(new Filter<BasicEntity>("!str", ["aaa"]).match(basic1)).toBe(false);
	expect(new Filter<BasicEntity>("!str", ["aaa"]).match(basic2)).toBe(true);
	expect(new Filter<BasicEntity>("!id", ["basic1"]).match(basic1)).toBe(false);
	expect(new Filter<BasicEntity>("!id", ["basic1"]).match(basic2)).toBe(true);
});
test("CONTAINS", () => {
	expectUnorderedKeys(new Filter<BasicEntity>("tags[]", "odd").transform(basics), ["basic1", "basic3", "basic5", "basic7", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("tags[]", "even").transform(basics), ["basic2", "basic4", "basic6", "basic8"]);
	expectUnorderedKeys(new Filter<BasicEntity>("tags[]", "prime").transform(basics), ["basic1", "basic2", "basic3", "basic5", "basic7"]);
	expectUnorderedKeys(new Filter<BasicEntity>("tags[]", "NOPE").transform(basics), []);
});
test("LT", () => {
	expectUnorderedKeys(new Filter<BasicEntity>("num<", 500).transform(basics), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new Filter<BasicEntity>("num<", 0).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("num<", 1000).transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("str<", "ddd").transform(basics), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new Filter<BasicEntity>("str<", "a").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("str<", "zzz").transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("id<", "basic3").transform(basics), ["basic1", "basic2"]);
	expectUnorderedKeys(new Filter<BasicEntity>("id<", "zzzzzz").transform(basics), getIDs(basics));
});
test("LTE", () => {
	expectUnorderedKeys(new Filter<BasicEntity>("num<=", 500).transform(basics), ["basic1", "basic2", "basic3", "basic4", "basic5"]);
	expectUnorderedKeys(new Filter<BasicEntity>("num<=", 0).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("num<=", 1000).transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("str<=", "ddd").transform(basics), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new Filter<BasicEntity>("str<=", "a").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("str<=", "zzz").transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("id<=", "basic3").transform(basics), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new Filter<BasicEntity>("id<=", "zzzzzz").transform(basics), getIDs(basics));
});
test("GT", () => {
	expectUnorderedKeys(new Filter<BasicEntity>("num>", 500).transform(basics), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("num>", 1000).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("num>", 0).transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("str>", "eee").transform(basics), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("str>", "kkk").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("str>", "").transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("id>", "basic7").transform(basics), ["basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("id>", "").transform(basics), getIDs(basics));
});
test("GTE", () => {
	expectUnorderedKeys(new Filter<BasicEntity>("num>=", 500).transform(basics), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("num>=", 1000).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("num>=", 0).transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("str>=", "eee").transform(basics), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("str>=", "kkk").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicEntity>("str>=", "").transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicEntity>("id>=", "basic7").transform(basics), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicEntity>("id>=", "").transform(basics), getIDs(basics));
});
