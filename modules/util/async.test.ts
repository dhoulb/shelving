import { Deferred } from "../index.js";

test("Deferred works correctly", async () => {
	const promise = new Deferred<string>();
	expect(promise).toBeInstanceOf(Promise);
	expect(promise).toBeInstanceOf(Deferred);
	expect(promise.resolve).toBeInstanceOf(Function);
	expect(promise.reject).toBeInstanceOf(Function);
	expect(promise.then()).toBeInstanceOf(Promise);
	// promise.resolve("ABC");
	setTimeout(() => {
		promise.resolve("ABC");
	}, 50);
	expect(await promise.then()).toBe("ABC");
});
