import { describe, expect, test } from "bun:test";
import { awaitConcurrent, getDeferred, Errors as ShelvingAggregateError } from "../index.js";

describe("Deferred", () => {
	test("Works correctly", async () => {
		const { promise, resolve, reject } = getDeferred<string>();
		expect(promise).toBeInstanceOf(Promise);
		expect(resolve).toBeInstanceOf(Function);
		expect(reject).toBeInstanceOf(Function);
		expect(promise.then()).toBeInstanceOf(Promise);
		// promise.resolve("ABC");
		setTimeout(() => {
			resolve("ABC");
		}, 50);
		expect<string>(await promise.then()).toBe("ABC");
	});
});
describe("awaitConcurrent()", () => {
	test("Works correctly with successful resolution", async () => {
		const result1 = await awaitConcurrent(
			Promise.resolve("A"),
			new Promise<string>(resolve => setTimeout(() => resolve("B"), 50)),
			Promise.resolve("C"),
		);
		const result2: readonly [string, string, string] = result1;
		expect(result2).toEqual(["A", "B", "C"]);
	});
	test("Works correctly with successful rejection", async () => {
		let a = "NOTA";
		let c = "NOTC";
		try {
			await awaitConcurrent(
				new Promise<string>(resolve =>
					setTimeout(() => {
						a = "A";
						resolve("A");
					}, 200),
				),
				new Promise<string>((_resolve, reject) =>
					setTimeout(() => {
						reject("B");
					}, 50),
				),
				new Promise<string>(resolve =>
					setTimeout(() => {
						c = "C";
						resolve("C");
					}, 200),
				),
			);
			expect.unreachable();
		} catch (thrown) {
			expect(a).toBe("A");
			expect(thrown).toBeInstanceOf(ShelvingAggregateError);
			expect((thrown as ShelvingAggregateError).errors).toEqual(["B"]);
			expect(c).toBe("C");
		}
	});
	test("Collects multiple errors in list order", async () => {
		try {
			await awaitConcurrent(
				new Promise<string>((_resolve, reject) => setTimeout(() => reject("A"), 100)),
				new Promise<string>((_resolve, reject) => setTimeout(() => reject("B"), 50)),
				Promise.resolve("C"),
			);
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(ShelvingAggregateError);
			expect((thrown as ShelvingAggregateError).errors).toEqual(["A", "B"]);
		}
	});
});
