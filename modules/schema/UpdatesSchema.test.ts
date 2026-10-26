import { describe, expect, test } from "bun:test";
import { ARRAY, DATA, NULLABLE, NUMBER, STRING, UPDATES, UpdatesSchema } from "shelving/schema";
import type { Updates } from "shelving/util/update";

const SUB = DATA({ str: STRING, num: NUMBER });
const SCHEMA = DATA({ str: STRING, num: NUMBER, tags: ARRAY(STRING), sub: SUB, nullable: NULLABLE(SUB) });
type T = {
	str: string;
	num: number;
	tags: readonly string[];
	sub: { str: string; num: number };
	nullable: { str: string; num: number } | null;
};
const UPDATES_SCHEMA = UPDATES(SCHEMA);

test("TypeScript", () => {
	const s1: UpdatesSchema<T> = UPDATES_SCHEMA;
	const s2: UpdatesSchema<T> = new UpdatesSchema({ data: SCHEMA });
	const u1: Updates<T> = UPDATES_SCHEMA.validate({ str: "a" });
});

describe("validate()", () => {
	test("must be object", () => {
		expect(() => UPDATES_SCHEMA.validate("a")).toThrow("Must be object");
	});
	test("validates set updates on top-level props", () => {
		expect(UPDATES_SCHEMA.validate({ str: "a", num: "12" })).toEqual({ str: "a", num: 12 });
		expect(() => UPDATES_SCHEMA.validate({ num: "bad" })).toThrow("num: Must be number");
	});
	test("validates set updates on deep props", () => {
		expect(UPDATES_SCHEMA.validate({ "sub.num": 1, "=sub.str": "a" })).toEqual({ "sub.num": 1, "=sub.str": "a" });
		expect(UPDATES_SCHEMA.validate({ "nullable.num": 1 } as never)).toEqual({ "nullable.num": 1 } as never);
		expect(() => UPDATES_SCHEMA.validate({ "sub.num": "bad" })).toThrow("sub.num: Must be number");
		expect(() => UPDATES_SCHEMA.validate({ "=sub.num": "bad" })).toThrow("=sub.num: Must be number");
	});
	test("validates a set update on a branch in full", () => {
		expect(UPDATES_SCHEMA.validate({ sub: { str: "a", num: 1, excess: true } })).toEqual({ sub: { str: "a", num: 1 } });
		expect(() => UPDATES_SCHEMA.validate({ sub: { str: "a", num: "bad" } })).toThrow("sub: num: Must be number");
		expect(UPDATES_SCHEMA.validate({ nullable: null })).toEqual({ nullable: null });
	});
	test("validates sum updates", () => {
		expect(UPDATES_SCHEMA.validate({ "+=num": 1, "-=sub.num": 2 })).toEqual({ "+=num": 1, "-=sub.num": 2 });
		expect(() => UPDATES_SCHEMA.validate({ "+=num": "1" })).toThrow("+=num: Must be number");
		expect(() => UPDATES_SCHEMA.validate({ "+=str": 1 })).toThrow("+=str: Must be number prop");
	});
	test("validates with and omit updates", () => {
		expect(UPDATES_SCHEMA.validate({ "+[]tags": "a", "-[]tags": ["b", "c"] })).toEqual({ "+[]tags": "a", "-[]tags": ["b", "c"] });
		expect(() => UPDATES_SCHEMA.validate({ "+[]tags": {} })).toThrow("+[]tags: Must be string");
		expect(() => UPDATES_SCHEMA.validate({ "-[]tags": ["a", {}] })).toThrow("-[]tags: 1: Must be string");
		expect(() => UPDATES_SCHEMA.validate({ "+[]str": "a" })).toThrow("+[]str: Must be array prop");
	});
	test("throws for unknown props", () => {
		expect(() => UPDATES_SCHEMA.validate({ nope: 1 })).toThrow("nope: Unknown prop");
		expect(() => UPDATES_SCHEMA.validate({ "sub.nope": 1 })).toThrow("sub.nope: Unknown prop");
		expect(() => UPDATES_SCHEMA.validate({ "+=nope": 1 })).toThrow("+=nope: Unknown prop");
		expect(() => UPDATES_SCHEMA.validate({ "str.length": 1 })).toThrow("str.length: Unknown prop");
	});
	test("removes undefined updates", () => {
		expect(UPDATES_SCHEMA.validate({ str: undefined, "+=num": undefined })).toEqual({});
	});
	test("joins messages for several failures", () => {
		expect(() => UPDATES_SCHEMA.validate({ num: "bad", nope: 1 })).toThrow("num: Must be number\nnope: Unknown prop");
	});
});
