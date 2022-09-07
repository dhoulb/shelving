import { State, runMicrotasks } from "../index.js";
import { expectToThrowPromiseLike } from "../test/util.js";

test("State with no initial value", async () => {
	const state = new State<number>();
	// SUbscribe.
	const calls1: number[] = [];
	const stop = state.next.subscribe(v => calls1.push(v));
	// Get with no value throws promise.
	expect(state.loading).toBe(true);
	expectToThrowPromiseLike(() => state.value);
	// Get with value gets value.
	expect(state.set(123)).toBe(undefined);
	expect(state.loading).toBe(false);
	expect(state.value).toBe(123);
	await runMicrotasks();
	expect(calls1).toEqual([123]);
	// Cleanup.
	stop();
});
test("State with initial value", async () => {
	const state = new State(111);
	expect(state).toBeInstanceOf(State);
	expect(state.loading).toBe(false);
	expect(state.value).toBe(111);
	// Listeners.
	const calls1: number[] = [];
	const stop = state.next.subscribe(v => calls1.push(v));
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
	expect(calls1).toEqual([222, 333]);
	// Cleanup.
	stop();
});
test("State with no initial value and multiple synchronous `set()` calls", async () => {
	const state = new State<number>(111);
	// Listeners.
	const calls1: number[] = [];
	const stop = state.next.subscribe(v => calls1.push(v));
	// Set multiple times.
	state.set(222);
	state.set(333);
	state.set(444);
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([444]);
	// Cleanup.
	stop();
});
test("State with no initial value and multiple synchronous `set()` calls", async () => {
	const state = new State<number>();
	// Listeners.
	const calls1: number[] = [];
	const stop = state.next.subscribe(v => calls1.push(v));
	// Set multiple times.
	state.set(222);
	state.set(333);
	state.set(444);
	// Checks.
	await runMicrotasks();
	expect(calls1).toEqual([444]);
	// Cleanup.
	stop();
});
