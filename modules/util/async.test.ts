import { getDeferred } from "../index.js";

test("Deferred works correctly", async () => {
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
