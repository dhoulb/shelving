import { Stream } from "..";

const microtasks = async () => [await Promise.resolve(), await Promise.resolve(), await Promise.resolve(), await Promise.resolve(), await Promise.resolve()];

test("Stream: works correctly", async () => {
	const stream = Stream.create<number>();
	expect(stream).toBeInstanceOf(Stream);
	// Ons and onces.
	const next1 = jest.fn();
	const complete1 = jest.fn();
	const error1 = jest.fn();
	const unsub1 = stream.subscribe(next1, complete1, error1);
	const next2 = jest.fn();
	const complete2 = jest.fn();
	const error2 = jest.fn();
	const unsub2 = stream.subscribe({ next: next2, complete: complete2, error: error2 });
	expect(stream.subscribers).toEqual(2);
	// Fire.
	expect(stream.next(111)).toBe(undefined);
	await microtasks();
	// Unsubscribe 1.
	expect(unsub1()).toBe(undefined);
	expect(stream.subscribers).toEqual(1);
	// Fire.
	expect(stream.next(222)).toBe(undefined);
	await microtasks();
	// Unsubscribe 2.
	expect(unsub2()).toBe(undefined);
	expect(stream.subscribers).toEqual(0);
	// Fire.
	expect(stream.next(333)).toBe(undefined);
	await microtasks();
	// Checks.
	expect(next1.mock.calls).toEqual([[111]]);
	expect(complete1.mock.calls).toEqual([]);
	expect(error1.mock.calls).toEqual([]);
	expect(next2.mock.calls).toEqual([[111], [222]]);
	expect(complete2.mock.calls).toEqual([]);
	expect(error2.mock.calls).toEqual([]);
});
test("Stream: all listeners are fired even if one errors", () => {
	const stream = Stream.create<number>();
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
test("Stream: promise: works", async () => {
	const stream = Stream.create<number>();
	const fn1 = jest.fn();
	stream.subscribe(fn1);
	const promise = stream.promise;
	expect(promise).toBeInstanceOf(Promise);
	const fn2 = jest.fn();
	expect(promise.then(fn2)).toBeInstanceOf(Promise);
	expect(stream.next(123)).toBe(undefined);
	await microtasks();
	expect(fn1.mock.calls).toEqual([[123]]);
	expect(fn2.mock.calls).toEqual([[123]]);
});
test("Stream: take(): taking a limited number of values", async () => {
	const stream = Stream.create<number>();
	const taken = stream.take(2);
	expect(taken).toBeInstanceOf(Stream);
	const next1 = jest.fn();
	const complete1 = jest.fn();
	const error1 = jest.fn();
	taken.subscribe(next1, error1, complete1);
	const next2 = jest.fn();
	const complete2 = jest.fn();
	const error2 = jest.fn();
	taken.subscribe({ next: next2, complete: complete2, error: error2 });
	expect(stream.subscribers).toBe(1);
	expect(taken.subscribers).toBe(2);
	expect(stream.next(2)).toBe(undefined);
	expect(stream.next(3)).toBe(undefined);
	expect(stream.next(4)).toBe(undefined);
	await microtasks();
	expect(error1.mock.calls).toEqual([]);
	expect(next1.mock.calls).toEqual([[2], [3]]);
	expect(complete1.mock.calls).toEqual([[undefined]]);
	expect(error2.mock.calls).toEqual([]);
	expect(next2.mock.calls).toEqual([[2], [3]]);
	expect(complete2.mock.calls).toEqual([[undefined]]);
});
test("Stream: derive(): derived stream", async () => {
	const stream = Stream.create<number>();
	const derived = stream.derive(num => num * num);
	const fn1 = jest.fn();
	derived.subscribe(fn1);
	expect(stream.next(2)).toBe(undefined);
	await microtasks();
	expect(stream.next(3)).toBe(undefined);
	await microtasks();
	expect(stream.next(4)).toBe(undefined);
	await microtasks();
	expect(fn1.mock.calls).toEqual([[4], [9], [16]]);
});
test("Stream: derive(): derived async stream", async () => {
	const stream = Stream.create<number>();
	const derived = stream.derive(async num => num * (await Promise.resolve(num)));
	await microtasks();
	const fn1 = jest.fn();
	derived.subscribe(fn1);
	expect(stream.next(2)).toBe(undefined);
	await microtasks();
	expect(stream.next(3)).toBe(undefined);
	await microtasks();
	expect(stream.next(4)).toBe(undefined);
	await microtasks();
	expect(fn1.mock.calls).toEqual([[4], [9], [16]]);
});
