import { Deferred, repeatUntil, repeatDelay, Signal } from "./async.js";

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
test("repeatUntil() and repeatDelay()", async () => {
	const yielded: number[] = [];
	const stop = new Signal();
	for await (const count of repeatUntil(repeatDelay(50), stop)) {
		yielded.push(count);
		if (count >= 3) stop.send();
	}
	expect(yielded).toEqual([1, 2, 3]);
});
