import { expect, test } from "bun:test";
import type { BranchData, Data, ImmutableDictionary, LeafData } from "../index.js";
import { getDataProp } from "../index.js";

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
		a: { a2: { a2a: true }, a1: 123 },
		"a.a1": 123,
		"a.a2": { a2a: true },
		"a.a2.a2a": true,
		g: "abc",
	};

	const validBranchData2: BranchData<X> = {
		str: "abc",
		num: 123,
		dict1: { a: 1, b: 2 },
		"dict1.a": 1,
		dict2: { a: { str: "abc", num: 123 } },
		"dict2.a": { str: "abc", num: 123 },
	};

	const invalidBranchData2: Partial<BranchData<T>> = {
		// @ts-expect-error "a.a1" is not string.
		"a.a1": "ERR",
		// @ts-expect-error "a.a2.a2a" is not boolean.
		"a.a2.a2a": 123,
		// @ts-expect-error "g" is not string.
		g: 123,
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
		g: "abc",
	};

	const validLeafData2: LeafData<X> = {
		str: "abc",
		num: 123,
		"dict1.a": 1,
		"dict2.a.str": "abc",
		"dict2.a.num": 123,
	};

	const invalidLeafData2: Partial<LeafData<T>> = {
		// @ts-expect-error "a.a1" is not string.
		"a.a1": "ERR",
		// @ts-expect-error "a.a2.a2a" is not boolean.
		"a.a2.a2a": 123,
		// @ts-expect-error "g" is not string.
		g: 123,
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
});
test("getDataProp()", () => {
	const obj = { a: "A", b: { b2: "B" } };
	// Works correctly.
	expect(getDataProp(obj, "a")).toBe("A");
	expect(getDataProp(obj, "b")).toBe(obj.b);
	expect(getDataProp(obj, "b.b2")).toBe("B");
});

// Empirical assignability matrix — what satisfies `Data` (string index signature) vs `object`.
interface DataInterface {
	readonly a: number;
}
class DataClass {
	readonly a = 1;
}

// Empirical result — `Data` accepts ONLY plain-object-literal and `type`-alias object types; it rejects
// interfaces, arrays, `Map`, and class instances (none get the implicit string index signature). `object`
// accepts every object shape and rejects only primitives. So `Data` is really an "object literal / type
// alias, not an interface or class" filter — a syntactic distinction, not a true "plain object" guard.
test("Data vs object assignability", () => {
	// Plain inline object — accepted by both.
	const plain = { a: 1 };
	const plainData: Data = plain;
	const plainObject: object = plain;

	// `type`-alias object — accepted by both (type aliases get an implicit string index signature).
	type AliasObject = { readonly a: number };
	const alias: AliasObject = { a: 1 };
	const aliasData: Data = alias;
	const aliasObject: object = alias;

	// `interface` object — rejected by `Data` (interfaces get no implicit index signature), accepted by `object`.
	const iface: DataInterface = { a: 1 };
	// @ts-expect-error `Data` rejects interfaces — no implicit string index signature.
	const ifaceData: Data = iface;
	const ifaceObject: object = iface;

	// Array — rejected by `Data`, accepted by `object`.
	const arr: readonly number[] = [1, 2, 3];
	// @ts-expect-error `Data` rejects arrays — no string index signature.
	const arrData: Data = arr;
	const arrObject: object = arr;

	// `Map` — rejected by `Data`, accepted by `object`.
	const map = new Map<string, number>();
	// @ts-expect-error `Data` rejects `Map` — no string index signature.
	const mapData: Data = map;
	const mapObject: object = map;

	// Class instance — rejected by `Data`, accepted by `object`.
	const inst = new DataClass();
	// @ts-expect-error `Data` rejects class instances — no string index signature.
	const instData: Data = inst;
	const instObject: object = inst;

	// Primitive — rejected by both.
	const prim = "x";
	// @ts-expect-error `Data` rejects primitives.
	const primData: Data = prim;
	// @ts-expect-error `object` rejects primitives.
	const primObject: object = prim;
});
