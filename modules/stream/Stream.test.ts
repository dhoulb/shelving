/* eslint-disable no-console */

import { jest } from "@jest/globals";
import { awaitNext, Stream, BLACKHOLE } from "../index.js";

test("Stream: works correctly", () => {
	const stream = new Stream<number>();
	expect(stream).toBeInstanceOf(Stream);
	expect(stream.closed).toBe(false);
	expect(stream.subscribers).toBe(0);
	// Ons and onces.
	const next1 = jest.fn();
	const error1 = jest.fn();
	const complete1 = jest.fn();
	const unsub1 = stream.subscribe({ next: next1, error: error1, complete: complete1 });
	const next2 = jest.fn();
	const error2 = jest.fn();
	const complete2 = jest.fn();
	const unsub2 = stream.subscribe({ next: next2, error: error2, complete: complete2 });
	const next3 = jest.fn();
	const error3 = jest.fn();
	const complete3 = jest.fn();
	const stream3 = stream.to();
	stream3.subscribe({ next: next3, error: error3, complete: complete3 });
	const next4 = jest.fn();
	const error4 = jest.fn();
	const complete4 = jest.fn();
	const stream4 = stream.to();
	stream4.subscribe({ next: next4, error: error4, complete: complete4 });
	expect(stream.subscribers).toEqual(4);
	// Fire.
	expect(stream.next(111)).toBe(undefined);
	// Unsubscribe 1.
	expect(unsub1()).toBe(undefined);
	expect(stream.subscribers).toEqual(3);
	// Fire.
	expect(stream.next(222)).toBe(undefined);
	// Unsubscribe 2.
	expect(unsub2()).toBe(undefined);
	expect(stream.subscribers).toEqual(2);
	// Fire.
	expect(stream.next(333)).toBe(undefined);
	expect(stream.closed).toBe(false);
	// Unsubscribe 3 (by completing the stream).
	expect(stream3.complete()).toBe(undefined);
	expect(stream3.closed).toBe(true);
	expect(stream.subscribers).toEqual(1);
	expect(stream.closed).toBe(false);
	// Error.
	expect(stream4.closed).toBe(false);
	expect(stream.error("nah")).toBe(undefined);
	expect(stream.closed).toBe(true);
	expect(stream.subscribers).toEqual(0);
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
	expect(complete3.mock.calls).toEqual([[]]);
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

	// Put console.log back.
	console.error = error;
});
test("toPromise(): works correctly", async () => {
	const state = new Stream<number>();
	setTimeout(() => state.next(123), 50);
	expect(await awaitNext(state)).toBe(123);
});
