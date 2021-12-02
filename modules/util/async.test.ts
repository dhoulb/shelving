import { Deferred } from "./async.js";

test("Deferred works correctly", async () => {
	const promise = new Deferred<string>();
	expect(promise).toBeInstanceOf(Promise);
	expect(promise).toBeInstanceOf(Deferred);
	expect(promise.resolve).toBeInstanceOf(Function);
	expect(promise.reject).toBeInstanceOf(Function);
	expect(promise.then()).toBeInstanceOf(Promise);
	setTimeout(() => promise.resolve("ABC"), 50);
	expect(await promise.then()).toBe("ABC");
});
