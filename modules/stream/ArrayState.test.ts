import { ArrayState } from "./ArrayState";

const microtasks = async () => [await Promise.resolve(), await Promise.resolve(), await Promise.resolve(), await Promise.resolve(), await Promise.resolve()];

test("ArrayState: array with initial value", async () => {
	const state = ArrayState.create<number>([1, 2, 3]);
	expect(state).toBeInstanceOf(ArrayState);
	expect(state.value).toEqual([1, 2, 3]);
	// Ons and onces.
	const fn1 = jest.fn();
	state.subscribe(fn1);
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
});
