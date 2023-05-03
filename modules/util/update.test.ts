/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { ImmutableDictionary, Updates } from "./index.js";
import { getUpdates, updateData } from "./index.js";

type T = {
	a: {
		readonly data: {
			readonly str: string;
			readonly num: number;
		};
		readonly str: string;
		readonly num: number;
	};
	readonly b: {
		readonly str: string;
		readonly num: number;
	};
	readonly str: "a";
	readonly num: number;
	readonly dict1: ImmutableDictionary<number>;
	readonly dict2: ImmutableDictionary<{
		readonly str: string;
		readonly num: number;
	}>;
};

const data: T = Object.freeze({
	a: Object.freeze({
		data: Object.freeze({
			str: "a",
			num: 1,
		}),
		str: "a",
		num: 1,
	}),
	b: Object.freeze({
		str: "b",
		num: 1,
	}),
	str: "a",
	num: 1,
	dict1: Object.freeze({ a: 1, b: 2 }),
	dict2: Object.freeze({
		a: {
			str: "a",
			num: 1,
		},
	}),
});

const updates: Updates<T> = {
	"a.str": "A",
	"a.data.str": "A",
	"+=num": 100,
	"+=a.num": 10,
	"-=a.data.num": 10,
	"=dict2.a.str": "A",
	"+=dict2.a.num": 100,
};

const validUpdates1: Updates<T> = {
	"a.str": "A",
};

const validUpdates2: Updates<T> = {
	"dict1.a": 123,
};

const validUpdates3: Updates<T> = {
	"dict2.a": { str: "a", num: 1 },
	"=dict2.a.num": 1,
};

type ISSTRING<J> = J extends string ? true : false;

type BBB = ISSTRING<"a">;

const invalidUpdates1: Updates<T> = {
	// @ts-expect-error "unknown" is not a known prop.
	unknown: "str",
};

const invalidUpdates2: Updates<T> = {
	// @ts-expect-error "a.unknown" is not a known prop.
	"a.unknown": "str",
};

const invalidUpdates3: Updates<T> = {
	// @ts-expect-error "str" is not number.
	str: 123,
};

const invalidUpdates4: Updates<T> = {
	// @ts-expect-error "a.unknown" is not a known prop.
	"a.num": "str",
};

const invalidUpdates5: Updates<T> = {
	// @ts-expect-error "str" is not string.
	"+=num": "str",
};

const invalidUpdates6: Updates<T> = {
	// @ts-expect-error "str" is not a number.
	"+=a.num": "str",
};

const invalidUpdates7: Updates<T> = {
	// @ts-expect-error "str" is not a number.
	"-=a": "str",
};

const invalidUpdates8: Updates<T> = {
	// @ts-expect-error "str" is not a number.
	"-=a.num": "str",
};

const invalidUpdates9: Updates<T> = {
	// @ts-expect-error "str" is not a number.
	"+=str": 123,
};

const invalidUpdates10: Updates<T> = {
	// @ts-expect-error "a.str" is not a number.
	"+=a.str": 123,
};

test("getUpdates()", () => {
	expect(getUpdates(updates)).toEqual([
		{ key: "a.str", action: "set", value: "A" },
		{ key: "a.data.str", action: "set", value: "A" },
		{ key: "num", action: "sum", value: 100 },
		{ key: "a.num", action: "sum", value: 10 },
		{ key: "a.data.num", action: "sum", value: -10 },
		{ key: "dict2.a.str", action: "set", value: "A" },
		{ key: "dict2.a.num", action: "sum", value: 100 },
	]);
});
test("updateObject()", () => {
	const updatedData: T = {
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
		dict1: { a: 1, b: 2 },
		dict2: {
			a: {
				str: "A",
				num: 101,
			},
		},
	};

	// Changes.
	expect(updateData(data, updates)).toEqual(updatedData);
	// Check cloning happend.
	expect(updateData(data, updates)).not.toBe(updatedData);
	expect(updateData(data, updates).a).not.toBe(updatedData.a);
	expect(updateData(data, updates).a.data).not.toBe(updatedData.a.data);
	// No changes.
	expect(updateData(data, {})).toBe(data);
});
