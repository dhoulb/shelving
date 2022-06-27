import { State } from "../index.js";
import { runMicrotasks } from "../test/util.js";

test("State", async () => {
	const state = new State<number>();
	const calls1: number[] = [];
	state.subscribe(v => calls1.push(v));
	expect(state.subscribers).toBe(1);
	expect(state.exists).toBe(false);
	expect(() => state.value).toThrow(Promise);
	expect(state.subscribers).toBe(2); // The two promises add temporary subscriptions.
	expect(state.next(123)).toBe(undefined);
	expect(state.exists).toBe(true);
	expect(state.value).toBe(123);
	await runMicrotasks();
	expect(calls1).toEqual([123]);
	expect(state.subscribers).toBe(1); // 2 unsubscribed after it received a value.
});
test("State with initial value", () => {
	const state = new State(111);
	expect(state).toBeInstanceOf(State);
	expect(state.exists).toBe(true);
	expect(state.value).toBe(111);
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
