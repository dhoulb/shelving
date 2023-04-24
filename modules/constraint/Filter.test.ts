import { basics, basic1, basic2, expectUnorderedKeys, BasicItemData } from "../test/index.js";
import { Data, Filter, FilterProps, getIDs } from "../index.js";

test("Filter type", () => {
	const syncTyped: Filter<{ b: number }> = undefined as unknown as Filter<{ b: number }>;
	const syncUntyped: Filter<Data> = syncTyped;
});
test("FilterProps type", () => {
	const props1: FilterProps<{ a: number }> = {};
	const props2: FilterProps<{ a: number }> = { a: 123 };

	// @ts-expect-error
	const props3: FilterProps<{ a: number }> = { b: 123 };
	// @ts-expect-error
	const props4: FilterProps<{ a: number }> = "a";
	// @ts-expect-error
	const props5: FilterProps<{ a: number }> = ["a"];
});
test("construct", () => {
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
	expect(new Filter<BasicItemData>("str", "aaa").match(basic1)).toBe(true);
	expect(new Filter<BasicItemData>("str", "aaa").match(basic2)).toBe(false);
	expect(new Filter<BasicItemData>("id", "basic1").match(basic1)).toBe(true);
	expect(new Filter<BasicItemData>("id", "basic1").match(basic2)).toBe(false);
	// Filter plain.
	expectUnorderedKeys(new Filter<BasicItemData>("str", "aaa").transform(basics), ["basic1"]);
	expectUnorderedKeys(new Filter<BasicItemData>("str", "NOPE").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicItemData>("num", 300).transform(basics), ["basic3"]);
	expectUnorderedKeys(new Filter<BasicItemData>("num", 999999).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicItemData>("group", "a").transform(basics), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new Filter<BasicItemData>("group", "b").transform(basics), ["basic4", "basic5", "basic6"]);
	expectUnorderedKeys(new Filter<BasicItemData>("group", "c").transform(basics), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicItemData>("id", "basic5").transform(basics), ["basic5"]);
	// Match deep.
	expect(new Filter<BasicItemData>("sub.str", "aaa").match(basic1)).toBe(true);
	expect(new Filter<BasicItemData>("sub.str", "aaa").match(basic2)).toBe(false);
	// Filter deep.
	expectUnorderedKeys(new Filter<BasicItemData>("sub.str", "aaa").transform(basics), ["basic1"]);
	expectUnorderedKeys(new Filter<BasicItemData>("sub.str", "NOPE").transform(basics), []);
});
test("IN", () => {
	// Match array.
	expect(new Filter<BasicItemData>("str", ["aaa"]).match(basic1)).toBe(true);
	expect(new Filter<BasicItemData>("str", ["aaa"]).match(basic2)).toBe(false);
	expect(new Filter<BasicItemData>("id", ["basic1"]).match(basic1)).toBe(true);
	expect(new Filter<BasicItemData>("id", ["basic1"]).match(basic2)).toBe(false);
});
test("NOT", () => {
	// Match plain.
	expect(new Filter<BasicItemData>("!str", "aaa").match(basic1)).toBe(false);
	expect(new Filter<BasicItemData>("!str", "aaa").match(basic2)).toBe(true);
	expect(new Filter<BasicItemData>("!id", "basic1").match(basic1)).toBe(false);
	expect(new Filter<BasicItemData>("!id", "basic1").match(basic2)).toBe(true);
	// Filter plain.
	expectUnorderedKeys(new Filter<BasicItemData>("!str", "aaa").transform(basics), ["basic2", "basic3", "basic4", "basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicItemData>("!group", "a").transform(basics), ["basic4", "basic5", "basic6", "basic7", "basic8", "basic9"]);
	// Match deep.
	expect(new Filter<BasicItemData>("!sub.str", "aaa").match(basic1)).toBe(false);
	expect(new Filter<BasicItemData>("!sub.str", "aaa").match(basic2)).toBe(true);
	// Filter deep.
	expectUnorderedKeys(new Filter<BasicItemData>("!sub.str", "aaa").transform(basics), ["basic2", "basic3", "basic4", "basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicItemData>("!sub.str", "NOPE").transform(basics), ["basic1", "basic2", "basic3", "basic4", "basic5", "basic6", "basic7", "basic8", "basic9"]);
});
test("OUT", () => {
	// Match array.
	expect(new Filter<BasicItemData>("!str", ["aaa"]).match(basic1)).toBe(false);
	expect(new Filter<BasicItemData>("!str", ["aaa"]).match(basic2)).toBe(true);
	expect(new Filter<BasicItemData>("!id", ["basic1"]).match(basic1)).toBe(false);
	expect(new Filter<BasicItemData>("!id", ["basic1"]).match(basic2)).toBe(true);
});
test("CONTAINS", () => {
	expectUnorderedKeys(new Filter<BasicItemData>("tags[]", "odd").transform(basics), ["basic1", "basic3", "basic5", "basic7", "basic9"]);
	expectUnorderedKeys(new Filter<BasicItemData>("tags[]", "even").transform(basics), ["basic2", "basic4", "basic6", "basic8"]);
	expectUnorderedKeys(new Filter<BasicItemData>("tags[]", "prime").transform(basics), ["basic1", "basic2", "basic3", "basic5", "basic7"]);
	expectUnorderedKeys(new Filter<BasicItemData>("tags[]", "NOPE").transform(basics), []);
});
test("LT", () => {
	expectUnorderedKeys(new Filter<BasicItemData>("num<", 500).transform(basics), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new Filter<BasicItemData>("num<", 0).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicItemData>("num<", 1000).transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicItemData>("str<", "ddd").transform(basics), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new Filter<BasicItemData>("str<", "a").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicItemData>("str<", "zzz").transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicItemData>("id<", "basic3").transform(basics), ["basic1", "basic2"]);
	expectUnorderedKeys(new Filter<BasicItemData>("id<", "zzzzzz").transform(basics), getIDs(basics));
});
test("LTE", () => {
	expectUnorderedKeys(new Filter<BasicItemData>("num<=", 500).transform(basics), ["basic1", "basic2", "basic3", "basic4", "basic5"]);
	expectUnorderedKeys(new Filter<BasicItemData>("num<=", 0).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicItemData>("num<=", 1000).transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicItemData>("str<=", "ddd").transform(basics), ["basic1", "basic2", "basic3", "basic4"]);
	expectUnorderedKeys(new Filter<BasicItemData>("str<=", "a").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicItemData>("str<=", "zzz").transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicItemData>("id<=", "basic3").transform(basics), ["basic1", "basic2", "basic3"]);
	expectUnorderedKeys(new Filter<BasicItemData>("id<=", "zzzzzz").transform(basics), getIDs(basics));
});
test("GT", () => {
	expectUnorderedKeys(new Filter<BasicItemData>("num>", 500).transform(basics), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicItemData>("num>", 1000).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicItemData>("num>", 0).transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicItemData>("str>", "eee").transform(basics), ["basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicItemData>("str>", "kkk").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicItemData>("str>", "").transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicItemData>("id>", "basic7").transform(basics), ["basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicItemData>("id>", "").transform(basics), getIDs(basics));
});
test("GTE", () => {
	expectUnorderedKeys(new Filter<BasicItemData>("num>=", 500).transform(basics), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicItemData>("num>=", 1000).transform(basics), []);
	expectUnorderedKeys(new Filter<BasicItemData>("num>=", 0).transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicItemData>("str>=", "eee").transform(basics), ["basic5", "basic6", "basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicItemData>("str>=", "kkk").transform(basics), []);
	expectUnorderedKeys(new Filter<BasicItemData>("str>=", "").transform(basics), getIDs(basics));
	expectUnorderedKeys(new Filter<BasicItemData>("id>=", "basic7").transform(basics), ["basic7", "basic8", "basic9"]);
	expectUnorderedKeys(new Filter<BasicItemData>("id>=", "").transform(basics), getIDs(basics));
});
