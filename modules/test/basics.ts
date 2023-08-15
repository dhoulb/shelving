import type { Item } from "../util/item.js";
import type { ValidatorType } from "../util/validate.js";
import { ALLOW_STRING } from "../schema/AllowSchema.js";
import { ARRAY } from "../schema/ArraySchema.js";
import { BOOLEAN } from "../schema/BooleanSchema.js";
import { DATA } from "../schema/DataSchema.js";
import { NUMBER } from "../schema/NumberSchema.js";
import { STRING } from "../schema/StringSchema.js";

export const BASIC_SCHEMA = DATA({
	str: STRING,
	num: NUMBER,
	group: ALLOW_STRING({ a: "A", b: "B", c: "C" }),
	tags: ARRAY(STRING),
	odd: BOOLEAN,
	even: BOOLEAN,
	sub: DATA({ str: STRING, num: NUMBER, odd: BOOLEAN, even: BOOLEAN }),
});
export type BasicData = ValidatorType<typeof BASIC_SCHEMA>;
export type BasicItemData = Item<BasicData>;

export const basic1: BasicItemData = { id: "basic1", str: "aaa", num: 100, even: false, odd: true, group: "a", tags: ["odd", "prime"], sub: { str: "aaa", num: 100, even: false, odd: true } };
export const basic2: BasicItemData = { id: "basic2", str: "bbb", num: 200, even: true, odd: false, group: "a", tags: ["even", "prime"], sub: { str: "bbb", num: 200, even: true, odd: false } };
export const basic3: BasicItemData = { id: "basic3", str: "ccc", num: 300, even: false, odd: true, group: "a", tags: ["odd", "prime"], sub: { str: "ccc", num: 300, even: false, odd: true } };
export const basic4: BasicItemData = { id: "basic4", str: "ddd", num: 400, even: true, odd: false, group: "b", tags: ["even"], sub: { str: "ddd", num: 400, even: true, odd: false } };
export const basic5: BasicItemData = { id: "basic5", str: "eee", num: 500, even: false, odd: true, group: "b", tags: ["odd", "prime"], sub: { str: "eee", num: 500, even: false, odd: true } };
export const basic6: BasicItemData = { id: "basic6", str: "fff", num: 600, even: true, odd: false, group: "b", tags: ["even"], sub: { str: "fff", num: 600, even: true, odd: false } };
export const basic7: BasicItemData = { id: "basic7", str: "ggg", num: 700, even: false, odd: true, group: "c", tags: ["odd", "prime"], sub: { str: "ggg", num: 700, even: false, odd: true } };
export const basic8: BasicItemData = { id: "basic8", str: "hhh", num: 800, even: true, odd: false, group: "c", tags: ["even"], sub: { str: "hhh", num: 800, even: true, odd: false } };
export const basic9: BasicItemData = { id: "basic9", str: "iii", num: 900, even: false, odd: true, group: "c", tags: ["odd"], sub: { str: "iii", num: 900, even: false, odd: true } };

export const basics: ReadonlyArray<BasicItemData> = [basic3, basic5, basic7, basic4, basic1, basic2, basic8, basic6, basic9];

export const basic999: BasicData = { str: "zzz", num: 999, even: false, odd: true, group: "a", tags: ["odd", "prime"], sub: { str: "zzz", num: 999, even: false, odd: true } };
