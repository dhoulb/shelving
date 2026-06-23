import { ARRAY } from "../schema/ArraySchema.js";
import { BOOLEAN } from "../schema/BooleanSchema.js";
import { CHOICE } from "../schema/ChoiceSchema.js";
import { DATA } from "../schema/DataSchema.js";
import { NUMBER } from "../schema/NumberSchema.js";
import { STRING } from "../schema/StringSchema.js";
import type { Item } from "../util/item.js";
import type { ValidatorType } from "../util/validate.js";

/**
 * Schema for a test "basic" fixture, exercising string, number, choice, array, boolean, and nested-data props.
 *
 * @see https://shelving.cc/test/BASIC_SCHEMA
 */
export const BASIC_SCHEMA = DATA({
	str: STRING,
	num: NUMBER,
	group: CHOICE({ a: "A", b: "B", c: "C" }),
	tags: ARRAY(STRING),
	odd: BOOLEAN,
	even: BOOLEAN,
	sub: DATA({ str: STRING, num: NUMBER, odd: BOOLEAN, even: BOOLEAN }),
});

/**
 * Validated data shape of a test basic, inferred from `BASIC_SCHEMA`.
 *
 * @see https://shelving.cc/test/BasicData
 */
export type BasicData = ValidatorType<typeof BASIC_SCHEMA>;

/**
 * A test basic as a stored `Item` — `BasicData` plus a string `id`.
 *
 * @see https://shelving.cc/test/BasicItem
 */
export type BasicItem = Item<string, BasicData>;

/**
 * Test basic fixture: `str: "aaa"`, `num: 100`, group `a`, odd.
 *
 * @see https://shelving.cc/test/basic1
 */
export const basic1: BasicItem = {
	id: "basic1",
	str: "aaa",
	num: 100,
	even: false,
	odd: true,
	group: "a",
	tags: ["odd", "prime"],
	sub: { str: "aaa", num: 100, even: false, odd: true },
};
/**
 * Test basic fixture: `str: "bbb"`, `num: 200`, group `a`, even.
 *
 * @see https://shelving.cc/test/basic2
 */
export const basic2: BasicItem = {
	id: "basic2",
	str: "bbb",
	num: 200,
	even: true,
	odd: false,
	group: "a",
	tags: ["even", "prime"],
	sub: { str: "bbb", num: 200, even: true, odd: false },
};
/**
 * Test basic fixture: `str: "ccc"`, `num: 300`, group `a`, odd.
 *
 * @see https://shelving.cc/test/basic3
 */
export const basic3: BasicItem = {
	id: "basic3",
	str: "ccc",
	num: 300,
	even: false,
	odd: true,
	group: "a",
	tags: ["odd", "prime"],
	sub: { str: "ccc", num: 300, even: false, odd: true },
};
/**
 * Test basic fixture: `str: "ddd"`, `num: 400`, group `b`, even.
 *
 * @see https://shelving.cc/test/basic4
 */
export const basic4: BasicItem = {
	id: "basic4",
	str: "ddd",
	num: 400,
	even: true,
	odd: false,
	group: "b",
	tags: ["even"],
	sub: { str: "ddd", num: 400, even: true, odd: false },
};
/**
 * Test basic fixture: `str: "eee"`, `num: 500`, group `b`, odd.
 *
 * @see https://shelving.cc/test/basic5
 */
export const basic5: BasicItem = {
	id: "basic5",
	str: "eee",
	num: 500,
	even: false,
	odd: true,
	group: "b",
	tags: ["odd", "prime"],
	sub: { str: "eee", num: 500, even: false, odd: true },
};
/**
 * Test basic fixture: `str: "fff"`, `num: 600`, group `b`, even.
 *
 * @see https://shelving.cc/test/basic6
 */
export const basic6: BasicItem = {
	id: "basic6",
	str: "fff",
	num: 600,
	even: true,
	odd: false,
	group: "b",
	tags: ["even"],
	sub: { str: "fff", num: 600, even: true, odd: false },
};
/**
 * Test basic fixture: `str: "ggg"`, `num: 700`, group `c`, odd.
 *
 * @see https://shelving.cc/test/basic7
 */
export const basic7: BasicItem = {
	id: "basic7",
	str: "ggg",
	num: 700,
	even: false,
	odd: true,
	group: "c",
	tags: ["odd", "prime"],
	sub: { str: "ggg", num: 700, even: false, odd: true },
};
/**
 * Test basic fixture: `str: "hhh"`, `num: 800`, group `c`, even.
 *
 * @see https://shelving.cc/test/basic8
 */
export const basic8: BasicItem = {
	id: "basic8",
	str: "hhh",
	num: 800,
	even: true,
	odd: false,
	group: "c",
	tags: ["even"],
	sub: { str: "hhh", num: 800, even: true, odd: false },
};
/**
 * Test basic fixture: `str: "iii"`, `num: 900`, group `c`, odd.
 *
 * @see https://shelving.cc/test/basic9
 */
export const basic9: BasicItem = {
	id: "basic9",
	str: "iii",
	num: 900,
	even: false,
	odd: true,
	group: "c",
	tags: ["odd"],
	sub: { str: "iii", num: 900, even: false, odd: true },
};

/**
 * Array of all nine test basic fixtures in a deliberately shuffled order, for exercising sort/query behaviour.
 *
 * @see https://shelving.cc/test/basics
 */
export const basics: ReadonlyArray<BasicItem> = [basic3, basic5, basic7, basic4, basic1, basic2, basic8, basic6, basic9];

/**
 * Standalone test basic data (no `id`): `str: "zzz"`, `num: 999`, for use as new/unsaved data.
 *
 * @see https://shelving.cc/test/basic999
 */
export const basic999: BasicData = {
	str: "zzz",
	num: 999,
	even: false,
	odd: true,
	group: "a",
	tags: ["odd", "prime"],
	sub: { str: "zzz", num: 999, even: false, odd: true },
};
