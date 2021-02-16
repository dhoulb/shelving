import { RequiredError, LOADING, BLACKHOLE, State } from "..";
import { createState } from "./State";

const microtasks = async () => [await Promise.resolve(), await Promise.resolve(), await Promise.resolve(), await Promise.resolve(), await Promise.resolve()];

test("State() with initial value", async () => {
	const state = createState<number>(111);
	expect(state).toBeInstanceOf(State);
	expect(state.value).toBe(111);
	expect(state.data).toBe(111);
	// Ons and onces.
	const fn1 = jest.fn();
	const fn2 = jest.fn();
	const fn3 = jest.fn();
	const fn4 = jest.fn();
	state.subscribe(fn1);
	state.take(1).subscribe(fn2);
	state.subscribe(fn3);
	state.take(1).subscribe(fn4);
	// Set new value.
	expect(state.set(222)).toBe(undefined);
	expect(state.value).toBe(222);
	await microtasks();
	// Set new value.
	expect(state.set(333)).toBe(undefined);
	expect(state.value).toBe(333);
	await microtasks();
	// Set same value again (doesn't fire again).
	expect(state.set(333)).toBe(undefined);
	expect(state.value).toBe(333);
	await microtasks();
	// Checks.
	expect(fn1.mock.calls).toEqual([[222], [333]]);
	expect(fn2.mock.calls).toEqual([[222]]);
	expect(fn3.mock.calls).toEqual([[222], [333]]);
	expect(fn4.mock.calls).toEqual([[222]]);
});
test("State() multiple updates in one tick only call listeners once", async () => {
	const state = createState<number>(111);
	const fn1 = jest.fn();
	state.subscribe(fn1);
	// Set several times synchronously.
	state.set(222);
	state.set(333);
	state.set(444);
	state.set(555);
	await microtasks();
	// Checks.
	expect(fn1.mock.calls).toEqual([[555]]);
});
test("State() data value throws if undefined", async () => {
	const state = createState<number | undefined>(undefined);
	expect(state).toBeInstanceOf(State);
	expect(state.value).toBe(undefined);
	expect(() => state.data).toThrow(RequiredError);
	expect(() => state.data).toThrow(new RequiredError("State.data: State data does not exist"));
	// Ons and onces.
	const fn1 = jest.fn();
	state.subscribe(fn1);
	// Set truthy value.
	expect(state.set(123)).toBe(undefined);
	expect(state.value).toBe(123);
	expect(state.data).toBe(123);
	await microtasks();
	// Set undefined value.
	expect(state.set(undefined)).toBe(undefined);
	expect(state.value).toBe(undefined);
	expect(() => state.data).toThrow(RequiredError);
	expect(() => state.data).toThrow(new RequiredError("State.data: State data does not exist"));
	await microtasks();
	// Checks.
	expect(fn1.mock.calls).toEqual([[123], [undefined]]);
});
test("State() updating works correctly", async () => {
	const state = createState<{ a: number; b: number }>({ a: 1, b: 2 });
	expect(state).toBeInstanceOf(State);
	expect(state.value).toEqual({ a: 1, b: 2 });
	// Ons and onces.
	const fn1 = jest.fn();
	const fn2 = jest.fn();
	state.subscribe(fn1);
	state.take(1).subscribe(fn2);
	// Merge.
	expect(state.update({ a: 111 })).toBe(undefined);
	expect(state.value).toEqual({ a: 111, b: 2 });
	await microtasks();
	// Checks.
	expect(fn1.mock.calls).toEqual([[{ a: 111, b: 2 }]]);
	expect(fn2.mock.calls).toEqual([[{ a: 111, b: 2 }]]);
});
test("State() array with initial value", async () => {
	const state = createState<number[]>([1, 2, 3]);
	expect(state).toBeInstanceOf(State);
	expect(state.value).toEqual([1, 2, 3]);
	// Ons and onces.
	const fn1 = jest.fn();
	const fn2 = jest.fn();
	state.subscribe(fn1);
	state.take(1).subscribe(fn2);
	// Has.
	expect(state.value.includes(1)).toBe(true);
	expect(state.value.includes(2)).toBe(true);
	expect(state.value.includes(3)).toBe(true);
	expect(state.value.includes(4)).toBe(false);
	// Add.
	expect(state.add(4)).toBe(undefined);
	expect(state.value).toEqual([1, 2, 3, 4]);
	await microtasks();
	// Remove.
	expect(state.remove(2)).toBe(undefined);
	expect(state.value).toEqual([1, 3, 4]);
	await microtasks();
	// Has.
	expect(state.value.includes(1)).toBe(true);
	expect(state.value.includes(2)).toBe(false);
	expect(state.value.includes(3)).toBe(true);
	expect(state.value.includes(4)).toBe(true);
	// Checks.
	expect(fn1.mock.calls).toEqual([[[1, 2, 3, 4]], [[1, 3, 4]]]);
	expect(fn2.mock.calls).toEqual([[[1, 2, 3, 4]]]);
});
test("State() initial LOADING", async () => {
	const state = createState<number>(LOADING);
	const fn1 = jest.fn();
	state.subscribe(fn1);
	expect(state.loading).toBe(true);
	const fn2 = jest.fn();
	try {
		state.value;
		expect(false).toBe(true); // Not reached.
	} catch (thrown) {
		expect(thrown).toBeInstanceOf(Promise);
		thrown.then(fn2);
	}
	const fn3 = jest.fn();
	try {
		state.data;
		expect(false).toBe(true); // Not reached.
	} catch (thrown) {
		expect(thrown).toBeInstanceOf(Promise);
		thrown.then(fn3);
	}
	expect(state.set(123)).toBe(undefined);
	expect(state.loading).toBe(false);
	expect(state.value).toBe(123);
	expect(state.data).toBe(123);
	await microtasks();
	expect(fn1.mock.calls).toEqual([[123]]);
	expect(fn2.mock.calls).toEqual([[123]]);
	expect(fn3.mock.calls).toEqual([[123]]);
});
test("State() initial promise", async () => {
	let resolve: (num: number) => void = BLACKHOLE;
	const promise = new Promise<number>(r => void (resolve = r));
	const state = createState(promise);
	const fn1 = jest.fn();
	state.subscribe(fn1);
	expect(state.loading).toBe(true);
	const fn2 = jest.fn();
	try {
		state.value;
		expect(false).toBe(true); // Not reached.
	} catch (thrown) {
		expect(thrown).toBeInstanceOf(Promise);
		thrown.then(fn2);
	}
	const fn3 = jest.fn();
	try {
		state.data;
		expect(false).toBe(true); // Not reached.
	} catch (thrown) {
		expect(thrown).toBeInstanceOf(Promise);
		thrown.then(fn3);
	}
	expect(resolve(123)).toBe(undefined);
	await microtasks();
	expect(state.loading).toBe(false);
	expect(state.value).toBe(123);
	expect(state.data).toBe(123);
	await microtasks();
	expect(fn1.mock.calls).toEqual([[123]]);
	expect(fn2.mock.calls).toEqual([[123]]);
	expect(fn3.mock.calls).toEqual([[123]]);
	state.set(456);
	expect(state.value).toBe(456);
	await microtasks();
	expect(fn1.mock.calls).toEqual([[123], [456]]);
	expect(fn2.mock.calls).toEqual([[123]]);
	expect(fn3.mock.calls).toEqual([[123]]);
});
test("State() promise in set", async () => {
	const state = createState<number>(111);
	const fn1 = jest.fn();
	state.subscribe(fn1);
	expect(state.loading).toBe(false);
	expect(state.value).toBe(111);
	expect(state.data).toBe(111);
	expect(state.set(Promise.resolve(222))).toBe(undefined);
	await microtasks();
	expect(state.value).toBe(222);
	expect(state.data).toBe(222);
	await microtasks();
	expect(fn1.mock.calls).toEqual([[222]]);
});
test("State() derived state", async () => {
	const state = createState<number>(10);
	const derived = state.derive(num => num * num);
	expect(derived.value).toBe(100);
	const fn1 = jest.fn();
	derived.subscribe(fn1);
	expect(state.set(2)).toBe(undefined);
	expect(state.value).toBe(2);
	await microtasks();
	expect(derived.value).toBe(4);
	expect(state.set(3)).toBe(undefined);
	expect(state.value).toBe(3);
	await microtasks();
	expect(derived.value).toBe(9);
	expect(state.set(4)).toBe(undefined);
	expect(state.value).toBe(4);
	await microtasks();
	expect(derived.value).toBe(16);
	expect(fn1.mock.calls).toEqual([[4], [9], [16]]);
});
test("State() derived async state", async () => {
	const state = createState<number>(10);
	const derived = state.derive(async num => num * (await Promise.resolve(num)));
	expect(derived.loading).toBe(true);
	expect(() => derived.value).toThrow(Promise);
	await microtasks();
	expect(derived.loading).toBe(false);
	expect(derived.value).toBe(100);
	const fn1 = jest.fn();
	derived.subscribe(fn1);
	expect(state.set(2)).toBe(undefined);
	await microtasks();
	expect(derived.value).toBe(4);
	expect(state.set(3)).toBe(undefined);
	await microtasks();
	expect(derived.value).toBe(9);
	expect(state.set(4)).toBe(undefined);
	await microtasks();
	expect(derived.value).toBe(16);
	expect(fn1.mock.calls).toEqual([[4], [9], [16]]);
});
test("State() thenable", async () => {
	const state = createState<number>(LOADING);
	setTimeout(() => state.set(123), 50);
	expect(await state).toBe(123);
});
