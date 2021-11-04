import { jest } from "@jest/globals";
import { RequiredError, LOADING, State } from "../index.js";
import { assertInstance, ResolvablePromise, SKIP } from "../util/index.js";

const microtasks = async () => [await Promise.resolve(), await Promise.resolve(), await Promise.resolve(), await Promise.resolve(), await Promise.resolve()];

test("State: with initial value", async () => {
	const state = new State<number>(111);
	expect(state).toBeInstanceOf(State);
	expect(state.loading).toBe(false);
	expect(state.value).toBe(111);
	expect(state.data).toBe(111);
	// Ons and onces.
	const fn1 = jest.fn<any, any>();
	const fn2 = jest.fn<any, any>();
	state.subscribe(fn1);
	state.subscribe(fn2);
	// Set new value.
	expect(state.next(222)).toBe(undefined);
	expect(state.value).toBe(222);
	await microtasks();
	// Skip a value.
	expect(state.next(SKIP)).toBe(undefined);
	await microtasks();
	// Set new value.
	expect(state.next(333)).toBe(undefined);
	expect(state.value).toBe(333);
	await microtasks();
	// Set same value again (doesn't fire again).
	expect(state.next(333)).toBe(undefined);
	expect(state.value).toBe(333);
	await microtasks();
	// Checks.
	expect(fn1.mock.calls).toEqual([[111], [222], [333]]);
	expect(fn2.mock.calls).toEqual([[111], [222], [333]]);
});
test("State: data value throws if undefined", async () => {
	const state = new State<number | undefined>(undefined);
	expect(state).toBeInstanceOf(State);
	expect(state.value).toBe(undefined);
	expect(() => state.data).toThrow(RequiredError);
	// Ons and onces.
	const fn1 = jest.fn<any, any>();
	state.subscribe(fn1);
	// Set truthy value.
	expect(state.next(123)).toBe(undefined);
	expect(state.value).toBe(123);
	expect(state.data).toBe(123);
	await microtasks();
	// Set undefined value.
	expect(state.next(undefined)).toBe(undefined);
	expect(state.value).toBe(undefined);
	expect(() => state.data).toThrow(RequiredError);
	await microtasks();
	// Checks.
	expect(fn1.mock.calls).toEqual([[undefined], [123], [undefined]]);
});
test("State: updating works correctly", async () => {
	const state = new State<{ a: number; b: number }>({ a: 1, b: 2 });
	expect(state).toBeInstanceOf(State);
	expect(state.value).toEqual({ a: 1, b: 2 });
	// Ons and onces.
	const fn1 = jest.fn<any, any>();
	state.subscribe(fn1);
	// Merge.
	expect(state.update({ a: 111 })).toBe(undefined);
	expect(state.value).toEqual({ a: 111, b: 2 });
	await microtasks();
	// Checks.
	expect(fn1.mock.calls).toEqual([[{ a: 1, b: 2 }], [{ a: 111, b: 2 }]]);
});
test("State: initial LOADING", async () => {
	const state = new State<number>(LOADING);
	const fn1 = jest.fn<any, any>();
	state.subscribe(fn1);
	expect(state.loading).toBe(true);
	const fn2 = jest.fn<any, any>();
	expect(() => state.value).toThrow(Promise);
	expect(() => state.data).toThrow(Promise);
	expect(state.next(123)).toBe(undefined);
	expect(state.loading).toBe(false);
	expect(state.value).toBe(123);
	expect(state.data).toBe(123);
	expect((state as any)._subscribers.length).toBe(1); // 2 and 3 unsubscribed after they received a value.
	await microtasks();
	expect(fn1.mock.calls).toEqual([[123]]);
});
test("State: initial promise", async () => {
	const promise = new ResolvablePromise<number>();
	const state = new State(promise);
	const fn1 = jest.fn<any, any>();
	state.subscribe(fn1);
	expect(state.loading).toBe(true);
	expect(() => state.value).toThrow(Promise);
	expect(() => state.data).toThrow(Promise);
	expect(promise.resolve(123)).toBe(undefined);
	await microtasks();
	expect(state.loading).toBe(false);
	expect(state.value).toBe(123);
	expect(state.data).toBe(123);
	await microtasks();
	expect(fn1.mock.calls).toEqual([[123]]);
	state.next(456);
	expect(state.value).toBe(456);
	await microtasks();
	expect(fn1.mock.calls).toEqual([[123], [456]]);
});
test("State: promise in next", async () => {
	const state = new State<number>(111);
	const fn1 = jest.fn<any, any>();
	state.subscribe(fn1);
	expect(state.loading).toBe(false);
	expect(state.value).toBe(111);
	expect(state.data).toBe(111);
	expect(state.next(Promise.resolve(SKIP))).toBe(undefined);
	await microtasks();
	expect(state.next(Promise.resolve(222))).toBe(undefined);
	await microtasks();
	expect(state.value).toBe(222);
	expect(state.data).toBe(222);
	await microtasks();
	expect(fn1.mock.calls).toEqual([[111], [222]]);
});
test("State: derived(): state", async () => {
	const state = new State<number>(10);
	const derived = state.derive(num => num * num);
	expect(derived.value).toBe(100);
	const fn1 = jest.fn<any, any>();
	derived.subscribe(fn1);
	expect(state.next(2)).toBe(undefined);
	expect(state.value).toBe(2);
	await microtasks();
	expect(derived.value).toBe(4);
	expect(state.next(3)).toBe(undefined);
	expect(state.value).toBe(3);
	await microtasks();
	expect(derived.value).toBe(9);
	expect(state.next(4)).toBe(undefined);
	expect(state.value).toBe(4);
	await microtasks();
	expect(derived.value).toBe(16);
	expect(fn1.mock.calls).toEqual([[100], [4], [9], [16]]);
});
test("State: derived(): async state", async () => {
	const state = new State<number>(10);
	const derived = state.derive(async num => num * (await Promise.resolve(num)));
	expect(derived.loading).toBe(true);
	expect(() => derived.value).toThrow(Promise);
	await microtasks();
	expect(derived.loading).toBe(false);
	expect(derived.value).toBe(100);
	const fn1 = jest.fn<any, any>();
	derived.subscribe(fn1);
	expect(state.next(2)).toBe(undefined);
	await microtasks();
	expect(derived.value).toBe(4);
	expect(state.next(3)).toBe(undefined);
	await microtasks();
	expect(derived.value).toBe(9);
	expect(state.next(4)).toBe(undefined);
	await microtasks();
	expect(derived.value).toBe(16);
	expect(fn1.mock.calls).toEqual([[100], [4], [9], [16]]);
});
