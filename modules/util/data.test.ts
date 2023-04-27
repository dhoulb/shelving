import type { DataProp, FlatData, FlatDataProp } from "../index.js";

type T = {
	readonly a: {
		readonly a1: number;
		readonly a2: {
			readonly a2a: boolean;
		};
	};
	readonly g: string;
};

test("FlatDataProp", () => {
	const validFlatDataProp1: ["a.a1", number] | ["a.a2.a2a", boolean] | ["g", string] = undefined as unknown as FlatDataProp<T>;

	const validFlatDataProp2: ["a", { readonly a1: number; readonly a2: { readonly a2a: boolean } }] | ["g", string] = undefined as unknown as DataProp<T>;
});
test("FlatData", () => {
	const validFlatData: FlatData<T> = {
		"a.a1": 123,
		"a.a2.a2a": true,
		"g": "abc",
	};

	// @ts-expect-error g is missing
	const invalidFlatData1: FlatData<T> = {
		"a.a1": 123,
		"a.a2.a2a": true,
		// "g": "abc",
	};

	const invalidFlatData2: FlatData<T> = {
		// @ts-expect-error "a.a1" is not string.
		"a.a1": "ERR",
		// @ts-expect-error "a.a2.a2a" is not boolean.
		"a.a2.a2a": 123,
		// @ts-expect-error "g" is not string.
		"g": 123,
	};

	const invalidFlatData3: Partial<FlatData<T>> = {
		// @ts-expect-error "unknown" is not a known prop.
		unknown: "abc",
	};

	const invalidFlatData4: Partial<FlatData<T>> = {
		// @ts-expect-error "a.unknown" is not a known prop.
		"a.unknown": 123,
	};

	const invalidFlatData5: Partial<FlatData<T>> = {
		// @ts-expect-error "a.a2.unknown" is not a known prop.
		"a.a2.unknown": true,
	};
});
