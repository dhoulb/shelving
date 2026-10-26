import { describe, expect, test } from "bun:test";
import { ARRAY, DATA, NULLABLE, NUMBER, QUERY, QuerySchema, STRING } from "shelving/schema";
import type { Query } from "shelving/util/query";

const SUB = DATA({ str: STRING, num: NUMBER });
const SCHEMA = DATA({ str: STRING, num: NUMBER, tags: ARRAY(STRING), sub: SUB, nullable: NULLABLE(NUMBER) });
type T = { str: string; num: number; tags: readonly string[]; sub: { str: string; num: number }; nullable: number | null };
const QUERY_SCHEMA = QUERY(SCHEMA);

test("TypeScript", () => {
	const s1: QuerySchema<T> = QUERY_SCHEMA;
	const s2: QuerySchema<T> = new QuerySchema({ data: SCHEMA });
	const q1: Query<T> = QUERY_SCHEMA.validate({ str: "a" });
});

describe("validate()", () => {
	test("must be object", () => {
		expect(() => QUERY_SCHEMA.validate("a")).toThrow("Must be object");
	});
	test("validates is and not filters", () => {
		expect(QUERY_SCHEMA.validate({ str: "a", "!num": "12" })).toEqual({ str: "a", "!num": 12 });
		expect(QUERY_SCHEMA.validate({ nullable: null })).toEqual({ nullable: null });
		expect(() => QUERY_SCHEMA.validate({ num: "bad" })).toThrow("num: Must be number");
		expect(() => QUERY_SCHEMA.validate({ "!num": "bad" })).toThrow("!num: Must be number");
	});
	test("validates in and out filters", () => {
		expect(QUERY_SCHEMA.validate({ str: ["a", "b"], "!num": [1, "2"] })).toEqual({ str: ["a", "b"], "!num": [1, 2] });
		expect(() => QUERY_SCHEMA.validate({ num: [1, "bad"] })).toThrow("num: 1: Must be number");
	});
	test("validates filters on deep props", () => {
		expect(QUERY_SCHEMA.validate({ "sub.num": 1, "sub.str>": "a" })).toEqual({ "sub.num": 1, "sub.str>": "a" });
		expect(() => QUERY_SCHEMA.validate({ "sub.num": "bad" })).toThrow("sub.num: Must be number");
	});
	test("validates range filters", () => {
		expect(QUERY_SCHEMA.validate({ "num<": 1, "num<=": 2, "num>": 3, "num>=": "4" })).toEqual({
			"num<": 1,
			"num<=": 2,
			"num>": 3,
			"num>=": 4,
		});
		expect(() => QUERY_SCHEMA.validate({ "num>": "bad" })).toThrow("num>: Must be number");
		expect(() => QUERY_SCHEMA.validate({ "num>=": [1, 2] })).toThrow("num>=: Must be number");
	});
	test("validates contains filters", () => {
		expect(QUERY_SCHEMA.validate({ "tags[]": "a" })).toEqual({ "tags[]": "a" });
		expect(() => QUERY_SCHEMA.validate({ "tags[]": {} })).toThrow("tags[]: Must be string");
		expect(() => QUERY_SCHEMA.validate({ "str[]": "a" })).toThrow("str[]: Must be array prop");
	});
	test("validates $order", () => {
		expect(QUERY_SCHEMA.validate({ $order: "!num" })).toEqual({ $order: "!num" });
		expect(QUERY_SCHEMA.validate({ $order: ["str", "!sub.num", undefined] })).toEqual({ $order: ["str", "!sub.num", undefined] });
		expect(() => QUERY_SCHEMA.validate({ $order: "nope" })).toThrow('$order: Unknown prop "nope"');
		expect(() => QUERY_SCHEMA.validate({ $order: ["str", "!nope"] })).toThrow('$order: Unknown prop "!nope"');
		expect(() => QUERY_SCHEMA.validate({ $order: 123 })).toThrow("$order: Must be string");
	});
	test("validates $limit", () => {
		expect(QUERY_SCHEMA.validate({ $limit: 10 })).toEqual({ $limit: 10 });
		expect(() => QUERY_SCHEMA.validate({ $limit: 0 })).toThrow("$limit:");
		expect(() => QUERY_SCHEMA.validate({ $limit: "bad" })).toThrow("$limit: Must be number");
	});
	test("throws for unknown props", () => {
		expect(() => QUERY_SCHEMA.validate({ nope: 1 })).toThrow("nope: Unknown prop");
		expect(() => QUERY_SCHEMA.validate({ "!nope": 1 })).toThrow("!nope: Unknown prop");
		expect(() => QUERY_SCHEMA.validate({ "sub.nope>": 1 })).toThrow("sub.nope>: Unknown prop");
		expect(() => QUERY_SCHEMA.validate({ "!num>": 1 })).toThrow("!num>: Unknown prop");
	});
	test("removes undefined filters", () => {
		expect(QUERY_SCHEMA.validate({ str: undefined, $limit: undefined })).toEqual({});
	});
});
