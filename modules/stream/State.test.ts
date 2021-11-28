import { jest } from "@jest/globals";
import { RequiredError, State, DataTransform, deriveState, initialState } from "../index.js";
import { runMicrotasks } from "../test/util.js";

test("State", () => {
	const state = new State<number>();
	const fn1 = jest.fn<any, any>();
	state.subscribe(fn1);
	expect(state.loading).toBe(true);
	expect(() => state.value).toThrow(Promise);
	expect(() => state.data).toThrow(Promise);
	expect(state.next(123)).toBe(undefined);
	expect(state.loading).toBe(false);
	expect(state.value).toBe(123);
	expect(state.data).toBe(123);
	expect(state.subscribers).toBe(1); // 2 and 3 unsubscribed after they received a value.
	expect(fn1.mock.calls).toEqual([[123]]);
});
test("State.prototype.required", () => {
	const state = initialState<number | undefined>(undefined);
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
	// Set undefined value.
	expect(state.next(undefined)).toBe(undefined);
	expect(state.value).toBe(undefined);
	expect(() => state.data).toThrow(RequiredError);
	// Checks.
	expect(fn1.mock.calls).toEqual([[undefined], [123], [undefined]]);
});
test("State.prototype.apply()", () => {
	const state = initialState({ a: 1, b: 2 });
	expect(state).toBeInstanceOf(State);
	expect(state.value).toEqual({ a: 1, b: 2 });
	// Ons and onces.
	const fn1 = jest.fn<any, any>();
	state.subscribe(fn1);
	// Apply a data deriver.
	expect(state.apply(new DataTransform<{ a: number; b: number }>({ a: 111 }))).toBe(undefined);
	expect(state.value).toEqual({ a: 111, b: 2 });
	// Checks.
	expect(fn1.mock.calls).toEqual([[{ a: 1, b: 2 }], [{ a: 111, b: 2 }]]);
});
test("initialState(): with initial value", () => {
	const state = initialState(111);
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
	// Set new value.
	expect(state.next(333)).toBe(undefined);
	expect(state.value).toBe(333);
	// Set same value again.
	expect(state.next(333)).toBe(undefined);
	expect(state.value).toBe(333);
	// Checks.
	expect(fn1.mock.calls).toEqual([[111], [222], [333]]);
	expect(fn2.mock.calls).toEqual([[111], [222], [333]]);
});
test("deriveState(): synchronous state", () => {
	const state = initialState(10);
	const derived = deriveState(state, num => num * num);
	expect(derived.value).toBe(100);
	const fn1 = jest.fn<any, any>();
	derived.subscribe(fn1);
	expect(state.next(2)).toBe(undefined);
	expect(state.value).toBe(2);
	expect(derived.value).toBe(4);
	expect(state.next(3)).toBe(undefined);
	expect(state.value).toBe(3);
	expect(derived.value).toBe(9);
	expect(state.next(4)).toBe(undefined);
	expect(state.value).toBe(4);
	expect(derived.value).toBe(16);
	expect(fn1.mock.calls).toEqual([[100], [4], [9], [16]]);
});
test("deriveState(): asynchronous state", async () => {
	const state = initialState(10);
	const derived = deriveState(state, async num => num * (await Promise.resolve(num)));
	expect(derived.loading).toBe(true);
	expect(() => derived.value).toThrow(Promise);
	await runMicrotasks();
	expect(derived.loading).toBe(false);
	expect(derived.value).toBe(100);
	const fn1 = jest.fn<any, any>();
	derived.subscribe(fn1);
	expect(state.next(2)).toBe(undefined);
	await runMicrotasks();
	expect(derived.value).toBe(4);
	expect(state.next(3)).toBe(undefined);
	await runMicrotasks();
	expect(derived.value).toBe(9);
	expect(state.next(4)).toBe(undefined);
	await runMicrotasks();
	expect(derived.value).toBe(16);
	expect(fn1.mock.calls).toEqual([[100], [4], [9], [16]]);
});
