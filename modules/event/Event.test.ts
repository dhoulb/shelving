import { createEvent, Event } from "..";

test("Event() works correctly", async () => {
	const event = createEvent<number>();
	expect(event).toBeInstanceOf(Event);
	// Ons and onces.
	const fn1 = jest.fn();
	const fn2 = jest.fn();
	const fn3 = jest.fn();
	const fn4 = jest.fn();
	const fn5 = jest.fn();
	const fn6 = jest.fn();
	const fn7 = jest.fn();
	const fn8 = jest.fn();
	const un1 = event.on(fn1);
	const un2 = event.one(fn2);
	const un3 = event.on(fn3);
	const un4 = event.one(fn4);
	const un5 = event.on(fn5);
	const un6 = event.one(fn6);
	const un7 = event.on(fn7);
	const un8 = event.one(fn8);
	expect(un1).toBeInstanceOf(Function);
	expect(un2).toBeInstanceOf(Function);
	expect(un3).toBeInstanceOf(Function);
	expect(un4).toBeInstanceOf(Function);
	expect(un5).toBeInstanceOf(Function);
	expect(un6).toBeInstanceOf(Function);
	expect(un7).toBeInstanceOf(Function);
	expect(un8).toBeInstanceOf(Function);
	expect(event).toMatchObject({ _ons: [fn1, fn2, fn3, fn4, fn5, fn6, fn7, fn8], _ones: [fn2, fn4, fn6, fn8] });
	// Unsubscribes.
	expect(un3()).toBe(undefined);
	expect(un4()).toBe(undefined);
	expect(event).toMatchObject({ _ons: [fn1, fn2, fn5, fn6, fn7, fn8], _ones: [fn2, fn6, fn8] });
	// Offs.
	expect(event.off(fn5)).toBe(undefined);
	expect(event.off(fn6)).toBe(undefined);
	expect(event).toMatchObject({ _ons: [fn1, fn2, fn7, fn8], _ones: [fn2, fn8] });
	// Fire.
	expect(event.fire(111)).toBe(undefined);
	await Promise.resolve();
	expect(event).toMatchObject({ _ons: [fn1, fn7], _ones: [] });
	// Fire again.
	expect(event.fire(222)).toBe(undefined);
	await Promise.resolve();
	expect(event).toMatchObject({ _ons: [fn1, fn7], _ones: [] });
	// Checks.
	expect(fn1.mock.calls).toEqual([[111], [222]]);
	expect(fn2.mock.calls).toEqual([[111]]);
	expect(fn3.mock.calls).toEqual([]); // Not called (unsubscribed).
	expect(fn4.mock.calls).toEqual([]); // Not called (unsubscribed).
	expect(fn5.mock.calls).toEqual([]); // Not called (off).
	expect(fn6.mock.calls).toEqual([]); // Not called (off).
	expect(fn7.mock.calls).toEqual([[111], [222]]);
	expect(fn8.mock.calls).toEqual([[111]]);
});
test("Event() all listeners are fired even if one errors", () => {
	const onError = jest.fn();
	const event = createEvent<number>({ onError }); // Blackhole the error.
	expect(event).toBeInstanceOf(Event);
	// Ons and onces.
	const fnBefore = jest.fn();
	const fnError = jest.fn(() => {
		throw new Error("ERROR");
	});
	const fnAfter = jest.fn();
	event.on(fnBefore);
	event.on(fnError);
	event.on(fnAfter);
	// Fire.
	expect(() => event.fire(111)).not.toThrow();
	// Checks.
	expect(fnBefore.mock.calls).toEqual([[111]]);
	expect(fnBefore.mock.results).toEqual([{ type: "return", value: undefined }]);
	expect(fnError.mock.calls).toEqual([[111]]);
	expect(fnError.mock.results).toEqual([{ type: "throw", value: new Error("ERROR") }]);
	expect(fnAfter.mock.calls).toEqual([[111]]);
	expect(fnAfter.mock.results).toEqual([{ type: "return", value: undefined }]);
	// Checks error was caught.
	expect(onError.mock.calls).toEqual([[new Error("ERROR")]]);
});
test("Event() options.fires works correctly", () => {
	const event = createEvent<number>({ fires: 1 });
	expect(event).toBeInstanceOf(Event);
	// Ons and onces.
	const fn1 = jest.fn();
	const fn2 = jest.fn();
	const fn3 = jest.fn();
	const fn4 = jest.fn();
	event.on(fn1);
	event.one(fn2);
	event.on(fn3);
	event.one(fn4);
	expect(event).toMatchObject({ _ons: { length: 4 }, _ones: { length: 2 } });
	// Fire (will only call fn4).
	expect(event.fire(111)).toBe(undefined);
	expect(event).toMatchObject({ _ons: { length: 3 }, _ones: { length: 1 } });
	// Fire (will only call fn3).
	expect(event.fire(222)).toBe(undefined);
	expect(event).toMatchObject({ _ons: { length: 3 }, _ones: { length: 1 } });
	// Fire (will only call fn3 again).
	expect(event.fire(333)).toBe(undefined);
	expect(event).toMatchObject({ _ons: { length: 3 }, _ones: { length: 1 } });
	// Off.
	expect(event.off(fn3)).toBe(undefined);
	expect(event).toMatchObject({ _ons: { length: 2 }, _ones: { length: 1 } });
	// Fire (will only call fn2).
	expect(event.fire(444)).toBe(undefined);
	expect(event).toMatchObject({ _ons: { length: 1 }, _ones: { length: 0 } });
	// Fire (will only call fn1).
	expect(event.fire(555)).toBe(undefined);
	expect(event).toMatchObject({ _ons: { length: 1 }, _ones: { length: 0 } });
	// Fire (will only call fn1 again).
	expect(event.fire(666)).toBe(undefined);
	expect(event).toMatchObject({ _ons: { length: 1 }, _ones: { length: 0 } });
	// Checks.
	expect(fn1.mock.calls).toEqual([[555], [666]]); // prettier-ignore
	expect(fn2.mock.calls).toEqual([[444]]);
	expect(fn3.mock.calls).toEqual([[222], [333]]); // prettier-ignore
	expect(fn4.mock.calls).toEqual([[111]]);
});
