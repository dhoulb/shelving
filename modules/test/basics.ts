import type { ValidatorType } from "../util/validate.js";
import { ALLOW_STRING } from "../schema/AllowSchema.js";
import { ARRAY } from "../schema/ArraySchema.js";
import { DATA } from "../schema/DataSchema.js";
import { NUMBER } from "../schema/NumberSchema.js";
import { STRING } from "../schema/StringSchema.js";

export const BASIC_SCHEMA = DATA({
	str: STRING,
	num: NUMBER,
	group: ALLOW_STRING(["a", "b", "c"]),
	tags: ARRAY(STRING),
});
export type BasicData = ValidatorType<typeof BASIC_SCHEMA>;

export const basic1: BasicData = { str: "aaa", num: 100, group: "a", tags: ["odd", "prime"] };
export const basic2: BasicData = { str: "bbb", num: 200, group: "a", tags: ["even", "prime"] };
export const basic3: BasicData = { str: "ccc", num: 300, group: "a", tags: ["odd", "prime"] };
export const basic4: BasicData = { str: "ddd", num: 400, group: "b", tags: ["even"] };
export const basic5: BasicData = { str: "eee", num: 500, group: "b", tags: ["odd", "prime"] };
export const basic6: BasicData = { str: "fff", num: 600, group: "b", tags: ["even"] };
export const basic7: BasicData = { str: "ggg", num: 700, group: "c", tags: ["odd", "prime"] };
export const basic8: BasicData = { str: "hhh", num: 800, group: "c", tags: ["even"] };
export const basic9: BasicData = { str: "iii", num: 900, group: "c", tags: ["odd"] };

export const basicResults = new Map<string, BasicData>([
	["basic3", basic3],
	["basic5", basic5],
	["basic7", basic7],
	["basic4", basic4],
	["basic1", basic1],
	["basic2", basic2],
	["basic8", basic8],
	["basic6", basic6],
	["basic9", basic9],
]);
