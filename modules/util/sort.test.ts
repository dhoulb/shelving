import { getProp, isObject, sortAscending, sortDescending } from "../index.js";

describe("sortAscending()", () => {
	test("sortAscending(): Zero items returns same instance", () => {
		const arr: unknown[] = [];
		expect(sortAscending(arr)).toBe(arr);
	});
	test("sortAscending(): One item returns same instance", () => {
		const arr = [1];
		expect(sortAscending(arr)).toBe(arr);
	});
	test("sortAscending(): No change returns same instance", () => {
		const arr1 = [1, 2, 3];
		expect(sortAscending(arr1)).toBe(arr1);
		const arr2 = [1, 2, 3, 4];
		expect(sortAscending(arr2)).toBe(arr2);
	});
	test("sortAscending(): Simple numbers are sorted correctly", () => {
		const arr = [2, 3, 1];
		expect(sortAscending(arr)).toEqual([1, 2, 3]);
	});
	test("sortAscending(): Simple values are sorted correctly", () => {
		const arr = [undefined, 1];
		expect(sortAscending(arr)).toEqual([1, undefined]);
	});
	test("sortAscending(): Numbers are sorted correctly", () => {
		const arr = [1, -1, -Infinity, 0.5, -0.5, Infinity, 100, 0, -100, NaN];
		const sorted = [-Infinity, -100, -1, -0.5, 0, 0.5, 1, 100, Infinity, NaN];
		expect(sortAscending(arr)).toEqual(sorted);
	});
	test("sortAscending(): Strings are sorted correctly", () => {
		const arr = ["0", "00", "1", "01", "001", "g", "z", "gg", "á", "😂", "a", "ê"];
		expect(sortAscending(arr)).toEqual(["😂", "0", "00", "001", "01", "1", "a", "á", "ê", "g", "gg", "z"]);
	});
	// test("sortAscending(): Dates are converted to number and sorted correctly", () => {
	// 	const arr = [new Date(2000), new Date(3000), new Date(1000)];
	// 	expect(sortAscending(arr)).toEqual([new Date(1000), new Date(2000), new Date(3000)]);
	// });
	describe("Props using extractFunction()", () => {
		test("sortAscending(): Two objects with props are sorted correctly", () => {
			const arr = [{ prop: 1 }, { prop: 0 }, { prop: -1 }];
			expect(sortAscending(arr, v => getProp(v, "prop"))).toEqual([{ prop: -1 }, { prop: 0 }, { prop: 1 }]);
		});
		test("sortAscending(): Object without props are sorted last", () => {
			const arr = [{}, { prop: -1 }, {}, { prop: 1 }, {}];
			expect(sortAscending(arr, v => getProp(v, "prop"))).toEqual([{ prop: -1 }, { prop: 1 }, {}, {}, {}]);
		});
		test("sortAscending(): Non-objects are sorted last", () => {
			const arr = [true, true, { prop: 0 }, true, { prop: -1 }, true, { prop: 1 }, true];
			const sorted = [{ prop: -1 }, { prop: 0 }, { prop: 1 }, true, true, true, true, true];
			expect(sortAscending(arr, v => isObject(v) && getProp(v, "prop"))).toEqual(sorted);
		});
	});
	describe("Deep props using extractFunction()", () => {
		test("sortAscending(): Two objects with subprops are sorted correctly", () => {
			const arr = [{ prop: { subprop: 1 } }, { prop: { subprop: 0 } }, { prop: { subprop: -1 } }];
			const sorted = [{ prop: { subprop: -1 } }, { prop: { subprop: 0 } }, { prop: { subprop: 1 } }];
			expect(sortAscending(arr, v => getProp(v, "prop", "subprop"))).toEqual(sorted);
		});
		test("sortAscending(): Object without subprops are sorted last", () => {
			const arr = [{ prop: {} }, { prop: { subprop: -1 } }, { prop: {} }, { prop: { subprop: 1 } }, { prop: {} }];
			const sorted = [{ prop: { subprop: -1 } }, { prop: { subprop: 1 } }, { prop: {} }, { prop: {} }, { prop: {} }];
			expect(sortAscending(arr, v => getProp(v, "prop", "subprop"))).toEqual(sorted);
		});
		test("sortAscending(): Non-objects are sorted last", () => {
			const arr = [true, true, { prop: { subprop: 0 } }, true, { prop: { subprop: -1 } }, true, { prop: { subprop: 1 } }, true];
			const sorted = [{ prop: { subprop: -1 } }, { prop: { subprop: 0 } }, { prop: { subprop: 1 } }, true, true, true, true, true];
			expect(sortAscending(arr, v => isObject(v) && getProp(v, "prop", "subprop"))).toEqual(sorted);
		});
	});
	test("sortAscending(): Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		expect(sortAscending(arr)).toEqual([-1, 0, 1, "0", "1", "a", true, false, null, {}, undefined]);
	});
});
describe("sortDescending()", () => {
	test("sortDescending(): Zero items returns same instance", () => {
		const arr: unknown[] = [];
		expect(sortDescending(arr)).toBe(arr);
	});
	test("sortDescending(): One item returns same instance", () => {
		const arr = [1];
		expect(sortDescending(arr)).toBe(arr);
	});
	test("sortDescending(): No change returns same instance", () => {
		const arr = [3, 2, 1];
		expect(sortDescending(arr)).toBe(arr);
	});
	test("sortDescending(): Simple numbers are sorted correctly", () => {
		const arr = [2, 1, 3];
		expect(sortDescending(arr)).toEqual([3, 2, 1]);
	});
	test("sortDescending(): Simple values are sorted correctly", () => {
		const arr = [1, undefined];
		expect(sortDescending(arr)).toEqual([undefined, 1]);
	});
	test("sortDescending(): Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		const sorted = [undefined, {}, null, false, true, "a", "1", "0", 1, 0, -1];
		expect(sortDescending(arr)).toEqual(sorted);
	});
});
