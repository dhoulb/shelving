import { ResolvablePromise } from "./promise.js";

test("ResolvablePromise works correctly", async () => {
	const promise = new ResolvablePromise<string>();
	expect(promise).toBeInstanceOf(Promise);
	expect(promise).toBeInstanceOf(ResolvablePromise);
	expect(promise.resolve).toBeInstanceOf(Function);
	expect(promise.reject).toBeInstanceOf(Function);
	expect(promise.then()).toBeInstanceOf(Promise);
	setTimeout(() => promise.resolve("ABC"), 50);
	expect(await promise.then()).toBe("ABC");
});
