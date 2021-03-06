import { ResolvablePromise } from "./promise";

test("ResolvablePromise works correctly", async () => {
	const promise = new ResolvablePromise<string>();
	expect(promise).toBeInstanceOf(Promise);
	expect(promise).toBeInstanceOf(ResolvablePromise);
	expect(promise.resolve).toBeInstanceOf(Function);
	expect(promise.reject).toBeInstanceOf(Function);
	expect(promise.then()).toBeInstanceOf(Promise);
	promise.resolve("ABC");
	expect(await promise.then()).toBe("ABC");
});
