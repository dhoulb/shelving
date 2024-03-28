import { getConcurrent, getDeferred } from "../index.js";

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
		expect(await promise.then()).toBe("ABC");
	});
});
describe("getConcurrent()", () => {
	test("Works correctly with successful resolution", async () => {
		const result1 = await getConcurrent(Promise.resolve("A"), new Promise<string>(resolve => setTimeout(() => resolve("B"), 50)), Promise.resolve("C"));
		const result2: readonly [string, string, string] = result1;
		expect(result2).toEqual(["A", "B", "C"]);
	});
	test("Works correctly with successful rejection", async () => {
		let a: string = "NOTA";
		let c: string = "NOTC";
		try {
			await getConcurrent(
				new Promise<string>(resolve =>
					setTimeout(() => {
						a = "A";
						resolve("A");
					}, 200),
				),
				new Promise<string>((resolve, reject) =>
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
			expect(false).toBe(true); // Not reached.
		} catch (thrown) {
			expect(a).toBe("A");
			expect(thrown).toBe("B");
			expect(c).toBe("C");
		}
	});
});
