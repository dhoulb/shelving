import { State, runMicrotasks } from "../index.js";
import { expectToThrowPromiseLike } from "../test/util.js";

test("State with no initial value", async () => {
	const state = new State<number>();
	// SUbscribe.
	const calls1: number[] = [];
	const calls2: number[] = [];
	const stop1 = state.to(v => calls1.push(v));
	const stop2 = state.next.to(v => calls2.push(v));
	await runMicrotasks();
	// Get with no value throws promise.
	expect(state.loading).toBe(true);
	expectToThrowPromiseLike(() => state.value);
	// Set initial value.
	expect(state.set(111)).toBe(undefined);
	expect(state.loading).toBe(false);
	expect(state.value).toBe(111);
	await runMicrotasks();
	// Set new value.
	expect(state.set(222)).toBe(undefined);
	expect(state.value).toBe(222);
	await runMicrotasks();
	// Set new value.
	expect(state.set(333)).toBe(undefined);
	expect(state.value).toBe(333);
	await runMicrotasks();
	// Set same value again.
	expect(state.set(333)).toBe(undefined);
	expect(state.value).toBe(333);
	// Checks.
	expect(calls1).toEqual([111, 222, 333]);
	expect(calls2).toEqual([111, 222, 333]);
	// Cleanup.
	stop1();
	stop2();
	// Set new value.
	expect(state.set(555)).toBe(undefined);
	expect(state.value).toBe(555);
	await runMicrotasks();
	// Checks.
	expect(calls1).toEqual([111, 222, 333]);
	expect(calls2).toEqual([111, 222, 333]);
});
test("State with initial value", async () => {
	const state = new State(111);
	expect(state).toBeInstanceOf(State);
	expect(state.loading).toBe(false);
	expect(state.value).toBe(111);
	// Listeners.
	const calls1: number[] = [];
	const calls2: number[] = [];
	const stop1 = state.to(v => calls1.push(v));
	const stop2 = state.next.to(v => calls2.push(v));
	await runMicrotasks();
	// Set new value.
	expect(state.set(222)).toBe(undefined);
	expect(state.value).toBe(222);
	await runMicrotasks();
	// Set new value.
	expect(state.set(333)).toBe(undefined);
	expect(state.value).toBe(333);
	await runMicrotasks();
	// Set same value again.
	expect(state.set(333)).toBe(undefined);
	expect(state.value).toBe(333);
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([111, 222, 333]);
	expect(calls2).toEqual([222, 333]);
	// Cleanup.
	stop1();
	stop2();
	// Set new value.
	expect(state.set(555)).toBe(undefined);
	expect(state.value).toBe(555);
	await runMicrotasks();
	// Checks.
	expect(calls1).toEqual([111, 222, 333]);
	expect(calls2).toEqual([222, 333]);
});
test("State with initial value and multiple synchronous `set()` calls", async () => {
	const state = new State<number>(111);
	// Listeners.
	const calls1: number[] = [];
	const calls2: number[] = [];
	const stop1 = state.to(v => calls1.push(v));
	const stop2 = state.next.to(v => calls2.push(v));
	// Set multiple times.
	state.set(222);
	state.set(333);
	state.set(444);
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([444]);
	expect(calls2).toEqual([444]);
	// Cleanup.
	stop1();
	stop2();
	// Set new value.
	expect(state.set(555)).toBe(undefined);
	expect(state.value).toBe(555);
	await runMicrotasks();
	// Checks.
	expect(calls1).toEqual([444]);
	expect(calls2).toEqual([444]);
});
test("State with no initial value and multiple synchronous `set()` calls", async () => {
	const state = new State<number>();
	// Listeners.
	const calls1: number[] = [];
	const calls2: number[] = [];
	const stop1 = state.to(v => calls1.push(v));
	const stop2 = state.next.to(v => calls2.push(v));
	// Set multiple times.
	state.set(222);
	state.set(333);
	state.set(444);
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([444]);
	expect(calls2).toEqual([444]);
	// Cleanup.
	stop1();
	stop2();
	// Set new value.
	expect(state.set(555)).toBe(undefined);
	expect(state.value).toBe(555);
	await runMicrotasks();
	// Checks.
	expect(calls1).toEqual([444]);
	expect(calls2).toEqual([444]);
});
