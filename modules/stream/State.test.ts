import { jest } from "@jest/globals";
import { RequiredError, State, DataTransform, initialState } from "../index.js";
import { runMicrotasks } from "../test/util.js";

test("State", async () => {
	const state = new State<number>();
	const calls1: number[] = [];
	state.subscribe(v => calls1.push(v));
	expect(state.subscribers).toBe(1);
	expect(state.loading).toBe(true);
	expect(() => state.value).toThrow(Promise);
	expect(() => state.data).toThrow(Promise);
	expect(state.subscribers).toBe(3); // The two promises add temporary subscriptions.
	expect(state.next(123)).toBe(undefined);
	expect(state.loading).toBe(false);
	expect(state.value).toBe(123);
	expect(state.data).toBe(123);
	await runMicrotasks();
	expect(calls1).toEqual([123]);
	expect(state.subscribers).toBe(1); // 2 and 3 unsubscribed after they received a value.
});
test("State.prototype.data", () => {
	const state = initialState<number | undefined>(undefined);
	expect(state).toBeInstanceOf(State);
	expect(state.value).toBe(undefined);
	expect(() => state.data).toThrow(RequiredError);
	// Ons and onces.
	const calls: (number | undefined)[] = [];
	state.subscribe(v => calls.push(v));
	// Set truthy value.
	expect(state.next(123)).toBe(undefined);
	expect(state.value).toBe(123);
	expect(state.data).toBe(123);
	// Set undefined value.
	expect(state.next(undefined)).toBe(undefined);
	expect(state.value).toBe(undefined);
	expect(() => state.data).toThrow(RequiredError);
	// Checks.
	expect(calls).toEqual([undefined, 123, undefined]);
});
test("State.prototype.apply()", () => {
	type V = { a: number; b: number };
	const state = initialState({ a: 1, b: 2 });
	expect(state).toBeInstanceOf(State);
	expect(state.value).toEqual({ a: 1, b: 2 });
	// Ons and onces.
	const calls: V[] = [];
	state.subscribe(v => calls.push(v));
	// Apply a data deriver.
	expect(state.apply(new DataTransform<V>({ a: 111 }))).toBe(undefined);
	expect(state.value).toEqual({ a: 111, b: 2 });
	// Checks.
	expect(calls).toEqual([
		{ a: 1, b: 2 },
		{ a: 111, b: 2 },
	]);
});
test("initialState(): with initial value", () => {
	const state = initialState(111);
	expect(state).toBeInstanceOf(State);
	expect(state.loading).toBe(false);
	expect(state.value).toBe(111);
	expect(state.data).toBe(111);
	// Ons and onces.
	const calls1: number[] = [];
	state.subscribe(v => calls1.push(v));
	const calls2: number[] = [];
	state.subscribe(v => calls2.push(v));
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
	expect(calls1).toEqual([111, 222, 333]);
	expect(calls2).toEqual([111, 222, 333]);
});
test("State.prototype.derive(): synchronous state", () => {
	const state = initialState(10);
	const derived = state.derive(num => num * num);
	expect(derived.value).toBe(100);
	const calls1: number[] = [];
	derived.subscribe(v => calls1.push(v));
	expect(state.next(2)).toBe(undefined);
	expect(state.value).toBe(2);
	expect(derived.value).toBe(4);
	expect(state.next(3)).toBe(undefined);
	expect(state.value).toBe(3);
	expect(derived.value).toBe(9);
	expect(state.next(4)).toBe(undefined);
	expect(state.value).toBe(4);
	expect(derived.value).toBe(16);
	expect(calls1).toEqual([100, 4, 9, 16]);
});
test("State.prototype.deriveAsync(): asynchronous state", async () => {
	const state = initialState(10);
	const derived = state.deriveAsync(async num => num * (await Promise.resolve(num)));
	expect(derived.loading).toBe(true);
	expect(() => derived.value).toThrow(Promise);
	await runMicrotasks();
	expect(derived.loading).toBe(false);
	expect(derived.value).toBe(100);
	const calls1: number[] = [];
	derived.subscribe(v => calls1.push(v));
	expect(state.next(2)).toBe(undefined);
	await runMicrotasks();
	expect(derived.value).toBe(4);
	expect(state.next(3)).toBe(undefined);
	await runMicrotasks();
	expect(derived.value).toBe(9);
	expect(state.next(4)).toBe(undefined);
	await runMicrotasks();
	expect(derived.value).toBe(16);
	expect(calls1).toEqual([100, 4, 9, 16]);
});
