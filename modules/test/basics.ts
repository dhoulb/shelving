import { ItemData } from "../db/Item.js";
import type { ValidatorType } from "../util/validate.js";
import { ALLOW_STRING } from "../schema/AllowSchema.js";
import { ARRAY } from "../schema/ArraySchema.js";
import { DATA } from "../schema/DataSchema.js";
import { NUMBER } from "../schema/NumberSchema.js";
import { STRING } from "../schema/StringSchema.js";

export const BASIC_SCHEMA = DATA({
	str: STRING,
	num: NUMBER,
	group: ALLOW_STRING({ a: "A", b: "B", c: "C" }),
	tags: ARRAY(STRING),
});
export type BasicData = ValidatorType<typeof BASIC_SCHEMA>;
export type BasicItemData = ItemData<BasicData>;

export const basic1: BasicItemData = { id: "basic1", str: "aaa", num: 100, group: "a", tags: ["odd", "prime"] };
export const basic2: BasicItemData = { id: "basic2", str: "bbb", num: 200, group: "a", tags: ["even", "prime"] };
export const basic3: BasicItemData = { id: "basic3", str: "ccc", num: 300, group: "a", tags: ["odd", "prime"] };
export const basic4: BasicItemData = { id: "basic4", str: "ddd", num: 400, group: "b", tags: ["even"] };
export const basic5: BasicItemData = { id: "basic5", str: "eee", num: 500, group: "b", tags: ["odd", "prime"] };
export const basic6: BasicItemData = { id: "basic6", str: "fff", num: 600, group: "b", tags: ["even"] };
export const basic7: BasicItemData = { id: "basic7", str: "ggg", num: 700, group: "c", tags: ["odd", "prime"] };
export const basic8: BasicItemData = { id: "basic8", str: "hhh", num: 800, group: "c", tags: ["even"] };
export const basic9: BasicItemData = { id: "basic9", str: "iii", num: 900, group: "c", tags: ["odd"] };

export const basics: ReadonlyArray<BasicItemData> = [basic3, basic5, basic7, basic4, basic1, basic2, basic8, basic6, basic9];
