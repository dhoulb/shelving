import { describe, expect, test } from "bun:test";
import { awaitAbort, awaitValues, getDeferred, Errors as ShelvingAggregateError } from "../index.js";

describe("awaitAbort()", () => {
	test("rejects when signal is already aborted", async () => {
		const controller = new AbortController();
		controller.abort("reason");
		await expect(awaitAbort(controller.signal)).rejects.toBe("reason");
	});
	test("rejects when signal fires after creation", async () => {
		const controller = new AbortController();
		const promise = awaitAbort(controller.signal);
		controller.abort("later");
		await expect(promise).rejects.toBe("later");
	});
	test("races against getDelay — delay wins when signal never fires", async () => {
		const controller = new AbortController();
		const { getDelay } = await import("./async.js");
		const result = await Promise.race([getDelay(10).then(() => "done"), awaitAbort(controller.signal).catch(() => "aborted")]);
		expect(result).toBe("done");
	});
	test("races against getDelay — abort wins when signal fires first", async () => {
		const controller = new AbortController();
		const { getDelay } = await import("./async.js");
		const race = Promise.race([getDelay(100).then(() => "done"), awaitAbort(controller.signal).catch(() => "aborted")]);
		controller.abort();
		expect(await race).toBe("aborted");
	});
});
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
		const result1 = await awaitValues(
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
			await awaitValues(
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
			await awaitValues(
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
