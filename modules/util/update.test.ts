/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Updates } from "./index.js";
import { getUpdates, updateData } from "./index.js";

const data = Object.freeze({
	a: Object.freeze({
		data: Object.freeze({
			str: "a" as string,
			num: 1 as number,
		}),
		str: "a" as string,
		num: 1 as number,
	}),
	b: Object.freeze({
		str: "b" as string,
		num: 1 as number,
	}),
	str: "a",
	num: 1 as number,
});

const updates: Updates<typeof data> = {
	"a.str": "A",
	"a.data.str": "A",
	"num+=": 100,
	"a.num+=": 10,
	"a.data.num-=": 10,
};

const updatedData: typeof data = {
	a: {
		data: {
			str: "A",
			num: -9,
		},
		str: "A",
		num: 11,
	},
	b: {
		str: "b",
		num: 1,
	},
	str: "a",
	num: 101,
};

const invalidUpdates1: Updates<typeof data> = {
	// @ts-expect-error "unknown" is not a known prop.
	unknown: "str",
};

const invalidUpdates2: Updates<typeof data> = {
	// @ts-expect-error "a.unknown" is not a known prop.
	"a.unknown": "str",
};

const invalidUpdates3: Updates<typeof data> = {
	// @ts-expect-error "str" is not number.
	str: 123,
};

const invalidUpdates4: Updates<typeof data> = {
	// @ts-expect-error "a.unknown" is not a known prop.
	"a.num": "str",
};

const invalidUpdates5: Updates<typeof data> = {
	// @ts-expect-error "str" is not string.
	"num+=": "str",
};

const invalidUpdates6: Updates<typeof data> = {
	// @ts-expect-error "str" is not a number.
	"a.num+=": "str",
};

const invalidUpdates7: Updates<typeof data> = {
	// @ts-expect-error "str" is not a number.
	"a-=": "str",
};

const invalidUpdates8: Updates<typeof data> = {
	// @ts-expect-error "str" is not a number.
	"a.num-=": "str",
};

const invalidUpdates9: Updates<typeof data> = {
	// @ts-expect-error "str" is not a number.
	"str+=": 123,
};

const invalidUpdates10: Updates<typeof data> = {
	// @ts-expect-error "a.str" is not a number.
	"a.str+=": 123,
};

test("getUpdates()", () => {
	expect(getUpdates(updates)).toEqual([
		{ keys: ["a", "str"], action: "set", value: "A" },
		{ keys: ["a", "data", "str"], action: "set", value: "A" },
		{ keys: ["num"], action: "sum", value: 100 },
		{ keys: ["a", "num"], action: "sum", value: 10 },
		{ keys: ["a", "data", "num"], action: "sum", value: -10 },
	]);
});
test("updateObject()", () => {
	// Changes.
	expect(updateData(data, updates)).toEqual(updatedData);
	// Check cloning happend.
	expect(updateData(data, updates)).not.toBe(updatedData);
	expect(updateData(data, updates).a).not.toBe(updatedData.a);
	expect(updateData(data, updates).a.data).not.toBe(updatedData.a.data);
	// No changes.
	expect(updateData(data, {})).toBe(data);
});
