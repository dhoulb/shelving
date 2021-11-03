/* eslint-disable no-console */

import { jest } from "@jest/globals";
import { getNextValue, Stream, SKIP, BLACKHOLE } from "../index.js";

const microtasks = async () => [await Promise.resolve(), await Promise.resolve(), await Promise.resolve(), await Promise.resolve(), await Promise.resolve()];

test("Stream: works correctly", () => {
	const stream = new Stream<number>();
	expect(stream).toBeInstanceOf(Stream);
	expect(stream.closed).toBe(false);
	expect((stream as any)._subscribers.length).toBe(0);
	// Ons and onces.
	const next1 = jest.fn<any, any>();
	const error1 = jest.fn<any, any>();
	const complete1 = jest.fn<any, any>();
	const unsub1 = stream.subscribe(next1, error1, complete1);
	const next2 = jest.fn<any, any>();
	const error2 = jest.fn<any, any>();
	const complete2 = jest.fn<any, any>();
	const unsub2 = stream.subscribe({ next: next2, error: error2, complete: complete2 });
	const next3 = jest.fn<any, any>();
	const error3 = jest.fn<any, any>();
	const complete3 = jest.fn<any, any>();
	const stream3 = new Stream(stream);
	stream3.subscribe(next3, error3, complete3);
	const next4 = jest.fn<any, any>();
	const error4 = jest.fn<any, any>();
	const complete4 = jest.fn<any, any>();
	const stream4 = new Stream(stream);
	stream4.subscribe({ next: next4, error: error4, complete: complete4 });
	expect((stream as any)._subscribers.length).toEqual(4);
	// Fire.
	expect(stream.next(111)).toBe(undefined);
	// Unsubscribe 1.
	expect(unsub1()).toBe(undefined);
	expect((stream as any)._subscribers.length).toEqual(3);
	// Fire.
	expect(stream.next(222)).toBe(undefined);
	// Unsubscribe 2.
	expect(unsub2()).toBe(undefined);
	expect((stream as any)._subscribers.length).toEqual(2);
	// Fire.
	expect(stream.next(333)).toBe(undefined);
	expect(stream.closed).toBe(false);
	// Unsubscribe 3 (by completing the stream).
	expect(stream3.complete()).toBe(undefined);
	expect(stream3.closed).toBe(true);
	expect((stream as any)._subscribers.length).toEqual(1);
	expect(stream.closed).toBe(false);
	// Error.
	expect(stream4.closed).toBe(false);
	expect(stream.error("nah")).toBe(undefined);
	expect(stream.closed).toBe(true);
	expect((stream as any)._subscribers.length).toEqual(0);
	expect(stream4.closed).toBe(true);
	// Checks.
	expect(next1.mock.calls).toEqual([[111]]);
	expect(error1.mock.calls).toEqual([]);
	expect(complete1.mock.calls).toEqual([]);
	expect(next2.mock.calls).toEqual([[111], [222]]);
	expect(error2.mock.calls).toEqual([]);
	expect(complete2.mock.calls).toEqual([]);
	expect(next3.mock.calls).toEqual([[111], [222], [333]]);
	expect(error3.mock.calls).toEqual([]);
	expect(complete3.mock.calls).toEqual([[undefined]]);
	expect(next4.mock.calls).toEqual([[111], [222], [333]]);
	expect(error4.mock.calls).toEqual([["nah"]]);
	expect(complete4.mock.calls).toEqual([]);
});
test("Stream: all listeners are fired even if one errors", () => {
	// Replace console.error() temporarily.
	// When we throw the error it's automatically logged to `console.error()` and its annoying to see this in the output.
	const error = console.error;
	console.error = BLACKHOLE;

	// Create a stream.
	const stream = new Stream<number>();
	expect(stream).toBeInstanceOf(Stream);
	// Ons and onces.
	const fnBefore = jest.fn<any, any>();
	const fnError = jest.fn(() => {
		throw new Error("ERROR");
	});
	const fnAfter = jest.fn<any, any>();
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

	// Put console.log back.
	console.error = error;
});
test("Stream: promised value as next value", async () => {
	const stream = new Stream<number>();
	const fn = jest.fn<any, any>();
	stream.subscribe(fn);
	// Fire.
	stream.next(Promise.resolve(111));
	expect(fn.mock.calls).toEqual([]);
	// Wait.
	await microtasks();
	// Checks.
	expect(fn.mock.calls).toEqual([[111]]);
});
test("Stream: SKIP value as next value", () => {
	const stream = new Stream<number>();
	const fn = jest.fn<any, any>();
	stream.subscribe(fn);
	// Fire.
	stream.next(111);
	stream.next(SKIP);
	stream.next(222);
	// Checks.
	expect(fn.mock.calls).toEqual([[111], [222]]);
});
test("toPromise(): works correctly", async () => {
	const state = new Stream<number>();
	setTimeout(() => state.next(123), 50);
	expect(await getNextValue(state)).toBe(123);
});
