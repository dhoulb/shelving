import type { BranchData, ImmutableDictionary, LeafData } from "../index.js";
import { getData, getDataProp } from "../index.js";

type T = {
	readonly a: {
		readonly a1: number;
		readonly a2: {
			readonly a2a: boolean;
		};
	};
	readonly g: string;
};

type X = {
	readonly str: string;
	readonly num: number;
	readonly dict1: ImmutableDictionary<number>;
	readonly dict2: ImmutableDictionary<{
		readonly str: string;
		readonly num: number;
	}>;
};

test("BranchData", () => {
	const validBranchData: BranchData<T> = {
		"a": { a2: { a2a: true }, a1: 123 },
		"a.a1": 123,
		"a.a2": { a2a: true },
		"a.a2.a2a": true,
		"g": "abc",
	};

	const validBranchData2: BranchData<X> = {
		"str": "abc",
		"num": 123,
		"dict1": { a: 1, b: 2 },
		"dict1.a": 1,
		"dict2": { a: { str: "abc", num: 123 } },
		"dict2.a": { str: "abc", num: 123 },
	};

	const invalidBranchData2: Partial<BranchData<T>> = {
		// @ts-expect-error "a.a1" is not string.
		"a.a1": "ERR",
		// @ts-expect-error "a.a2.a2a" is not boolean.
		"a.a2.a2a": 123,
		// @ts-expect-error "g" is not string.
		"g": 123,
	};

	const invalidBranchData3: Partial<BranchData<T>> = {
		// @ts-expect-error "unknown" is not a known prop.
		unknown: "abc",
	};

	const invalidBranchData4: Partial<BranchData<T>> = {
		// @ts-expect-error "a.unknown" is not a known prop.
		"a.unknown": 123,
	};

	const invalidBranchData5: Partial<BranchData<T>> = {
		// @ts-expect-error "a.a2.unknown" is not a known prop.
		"a.a2.unknown": true,
	};
});
test("LeafData", () => {
	const validLeafData: LeafData<T> = {
		"a.a1": 123,
		"a.a2.a2a": true,
		"g": "abc",
	};

	const validLeafData2: LeafData<X> = {
		"str": "abc",
		"num": 123,
		"dict1.a": 1,
		"dict2.a.str": "abc",
		"dict2.a.num": 123,
	};

	/**
	 * @todo Typescript can't infer type from template literal in computed property key.
	 * - See https://github.com/microsoft/TypeScript/issues/13948
	 * - Workaround is currently to use `getData()` and construct an object manually.
	 */
	// @ts-expect-error This will error until Typescript fixes the issue.
	const validLeafData3: Partial<LeafData<X>> = {
		[`dict2.${"id"}.num`]: 123,
	};
	const validLeafData4: Partial<LeafData<X>> = getData<LeafData<X>>([
		[`dict2.${"id"}.num`, 123], //
	]);

	const invalidLeafData2: Partial<LeafData<T>> = {
		// @ts-expect-error "a.a1" is not string.
		"a.a1": "ERR",
		// @ts-expect-error "a.a2.a2a" is not boolean.
		"a.a2.a2a": 123,
		// @ts-expect-error "g" is not string.
		"g": 123,
	};

	const invalidLeafData3: Partial<LeafData<T>> = {
		// @ts-expect-error "unknown" is not a known prop.
		unknown: "abc",
	};

	const invalidLeafData4: Partial<LeafData<T>> = {
		// @ts-expect-error "a.unknown" is not a known prop.
		"a.unknown": 123,
	};

	const invalidLeafData5: Partial<LeafData<T>> = {
		// @ts-expect-error "a.a2.unknown" is not a known prop.
		"a.a2.unknown": true,
	};

	const invalidLeafData6: Partial<LeafData<X>> = getData<LeafData<X>>(
		// @ts-expect-error Should be number not string.
		[[`dict2.${"id"}.num`, "a"]],
	);
});
test("getDataProp()", () => {
	const obj = { a: "A", b: { b2: "B" } };
	// Works correctly.
	expect(getDataProp(obj, "a")).toBe("A");
	expect(getDataProp(obj, "b")).toBe(obj.b);
	expect(getDataProp(obj, "b.b2")).toBe("B");
});
