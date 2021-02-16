import { Stream, createStream } from "..";

const microtasks = async () => [await Promise.resolve(), await Promise.resolve(), await Promise.resolve(), await Promise.resolve(), await Promise.resolve()];

test("createStream() works correctly", async () => {
	const stream = createStream<number>();
	expect(stream).toBeInstanceOf(Stream);
	// Ons and onces.
	const fnNormal = jest.fn();
	const fnOne = jest.fn();
	const fnUn = jest.fn();
	const fnObNormal = jest.fn();
	const obNormal = { next: fnObNormal };
	const fnObOne = jest.fn();
	const obOne = { next: fnObOne };
	const fnObUn = jest.fn();
	const obUn = { next: fnObUn };
	stream.subscribe(fnNormal);
	stream.take(1).subscribe(fnOne);
	const fnUnUn = stream.subscribe(fnUn);
	stream.subscribe(obNormal);
	stream.take(1).subscribe(obOne);
	const obUnUn = stream.subscribe(obUn);
	expect(stream.subscribers).toEqual(6);
	// Fire.
	expect(stream.next(111)).toBe(undefined);
	await microtasks();
	expect(stream.subscribers).toEqual(4);
	// Unsubscribes.
	expect(fnUnUn()).toBe(undefined);
	expect(obUnUn()).toBe(undefined);
	expect(stream.subscribers).toEqual(2);
	// Fire.
	expect(stream.next(222)).toBe(undefined);
	await microtasks();
	expect(stream.subscribers).toEqual(2);
	// Checks.
	expect(fnNormal.mock.calls).toEqual([[111], [222]]);
	expect(fnOne.mock.calls).toEqual([[111]]);
	expect(fnUn.mock.calls).toEqual([[111]]);
	expect(fnObNormal.mock.calls).toEqual([[111], [222]]);
	expect(fnObOne.mock.calls).toEqual([[111]]);
	expect(fnObUn.mock.calls).toEqual([[111]]);
});
test("createStream() all listeners are fired even if one errors", () => {
	const stream = createStream<number>();
	expect(stream).toBeInstanceOf(Stream);
	// Ons and onces.
	const fnBefore = jest.fn();
	const fnError = jest.fn(() => {
		throw new Error("ERROR");
	});
	const fnAfter = jest.fn();
	stream.subscribe(fnBefore);
	stream.subscribe(fnError);
	stream.subscribe(fnAfter);
	// Fire.
	expect(() => stream.next(111)).not.toThrow();
	// Checks.
	expect(fnBefore.mock.calls).toEqual([[111]]);
	expect(fnBefore.mock.results).toEqual([{ type: "return", value: undefined }]);
	expect(fnError.mock.calls).toEqual([[111]]);
	expect(fnError.mock.results).toEqual([{ type: "throw", value: new Error("ERROR") }]);
	expect(fnAfter.mock.calls).toEqual([[111]]);
	expect(fnAfter.mock.results).toEqual([{ type: "return", value: undefined }]);
});
test("State() then() implementation", async () => {
	const stream = createStream<number>();
	const fn1 = jest.fn();
	stream.subscribe(fn1);
	const promise = stream.then();
	expect(promise).toBeInstanceOf(Promise);
	const fn2 = jest.fn();
	expect(promise.then(fn2)).toBeInstanceOf(Promise);
	expect(stream.next(123)).toBe(undefined);
	await microtasks();
	expect(fn1.mock.calls).toEqual([[123]]);
	expect(fn2.mock.calls).toEqual([[123]]);
});
