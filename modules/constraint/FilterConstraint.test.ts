import { basics, basic1, basic2, expectUnorderedKeys, BasicItemData } from "../test/index.js";
import { Data, FilterConstraint, getIDs } from "../index.js";

test("Typescript", () => {
	const syncTyped: FilterConstraint<{ b: number }> = undefined as unknown as FilterConstraint<{ b: number }>;
	const syncUntyped: FilterConstraint<Data> = syncTyped;
});
test("construct", () => {
	expect(new FilterConstraint("a", 1)).toMatchObject({ key: "a", operator: "IS", value: 1 });
	expect(new FilterConstraint("!a", 1)).toMatchObject({ key: "a", operator: "NOT", value: 1 });
	expect(new FilterConstraint("a", [1])).toMatchObject({ key: "a", operator: "IN", value: [1] });
	expect(new FilterConstraint("!a", [1])).toMatchObject({ key: "a", operator: "OUT", value: [1] });
	expect(new FilterConstraint("a[]", 1)).toMatchObject({ key: "a", operator: "CONTAINS", value: 1 });
	expect(new FilterConstraint("a>", 1)).toMatchObject({ key: "a", operator: "GT", value: 1 });
	expect(new FilterConstraint("a>=", 1)).toMatchObject({ key: "a", operator: "GTE", value: 1 });
	expect(new FilterConstraint("a<", 1)).toMatchObject({ key: "a", operator: "LT", value: 1 });
	expect(new FilterConstraint("a<=", 1)).toMatchObject({ key: "a", operator: "LTE", value: 1 });
});
test("IS", () => {
	// Match plain.
	expect(new FilterConstraint<BasicItemData>("str", "aaa").match(basic1)).toBe(true);
	expect(new FilterConstraint<BasicItemData>("str", "aaa").match(basic2)).toBe(false);
	expect(new FilterConstraint<BasicItemData>("id", "basic1").match(basic1)).toBe(true);
	expect(new FilterConstraint<BasicItemData>("id", "basic1").match(basic2)).toBe(false);
	// Filter plain.
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str", "aaa").transform(basics), ["basic1"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str", "NOPE").transform(basics), []);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num", 300).transform(basics), ["basic3"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num", 999999).transform(basics), []);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("group", "a").transform(basics), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("group", "b").transform(basics), ["basic4", "basic5", "basic6"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("group", "c").transform(basics), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("id", "basic5").transform(basics), ["basic5"]);
});
test("IN", () => {
	// Match array.
	expect(new FilterConstraint<BasicItemData>("str", ["aaa"]).match(basic1)).toBe(true);
	expect(new FilterConstraint<BasicItemData>("str", ["aaa"]).match(basic2)).toBe(false);
	expect(new FilterConstraint<BasicItemData>("id", ["basic1"]).match(basic1)).toBe(true);
	expect(new FilterConstraint<BasicItemData>("id", ["basic1"]).match(basic2)).toBe(false);
});
test("NOT", () => {
	// Match plain.
	expect(new FilterConstraint<BasicItemData>("!str", "aaa").match(basic1)).toBe(false);
	expect(new FilterConstraint<BasicItemData>("!str", "aaa").match(basic2)).toBe(true);
	expect(new FilterConstraint<BasicItemData>("!id", "basic1").match(basic1)).toBe(false);
	expect(new FilterConstraint<BasicItemData>("!id", "basic1").match(basic2)).toBe(true);
	// Filter plain.
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("!str", "aaa").transform(basics), ["basic2", "basic3", "basic4", "basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("!group", "a").transform(basics), ["basic4", "basic5", "basic6", "basic7", "basic8", "basic9"]);
});
test("OUT", () => {
	// Match array.
	expect(new FilterConstraint<BasicItemData>("!str", ["aaa"]).match(basic1)).toBe(false);
	expect(new FilterConstraint<BasicItemData>("!str", ["aaa"]).match(basic2)).toBe(true);
	expect(new FilterConstraint<BasicItemData>("!id", ["basic1"]).match(basic1)).toBe(false);
	expect(new FilterConstraint<BasicItemData>("!id", ["basic1"]).match(basic2)).toBe(true);
});
test("CONTAINS", () => {
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("tags[]", "odd").transform(basics), ["basic1", "basic3", "basic5", "basic7", "basic9"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("tags[]", "even").transform(basics), ["basic2", "basic4", "basic6", "basic8"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("tags[]", "prime").transform(basics), ["basic1", "basic2", "basic3", "basic5", "basic7"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("tags[]", "NOPE").transform(basics), []);
});
test("LT", () => {
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num<", 500).transform(basics), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num<", 0).transform(basics), []);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num<", 1000).transform(basics), getIDs(basics));
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str<", "ddd").transform(basics), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str<", "a").transform(basics), []);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str<", "zzz").transform(basics), getIDs(basics));
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("id<", "basic3").transform(basics), ["basic1", "basic2"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("id<", "zzzzzz").transform(basics), getIDs(basics));
});
test("LTE", () => {
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num<=", 500).transform(basics), ["basic1", "basic2", "basic3", "basic4", "basic5"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num<=", 0).transform(basics), []);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num<=", 1000).transform(basics), getIDs(basics));
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str<=", "ddd").transform(basics), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str<=", "a").transform(basics), []);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str<=", "zzz").transform(basics), getIDs(basics));
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("id<=", "basic3").transform(basics), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("id<=", "zzzzzz").transform(basics), getIDs(basics));
});
test("GT", () => {
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num>", 500).transform(basics), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num>", 1000).transform(basics), []);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num>", 0).transform(basics), getIDs(basics));
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str>", "eee").transform(basics), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str>", "kkk").transform(basics), []);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str>", "").transform(basics), getIDs(basics));
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("id>", "basic7").transform(basics), ["basic8", "basic9"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("id>", "").transform(basics), getIDs(basics));
});
test("GTE", () => {
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num>=", 500).transform(basics), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num>=", 1000).transform(basics), []);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("num>=", 0).transform(basics), getIDs(basics));
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str>=", "eee").transform(basics), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str>=", "kkk").transform(basics), []);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("str>=", "").transform(basics), getIDs(basics));
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("id>=", "basic7").transform(basics), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new FilterConstraint<BasicItemData>("id>=", "").transform(basics), getIDs(basics));
});
