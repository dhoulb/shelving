import { awaitNext, awaitComplete, Subject, connectDerived, connectAsyncDerived } from "../index.js";
import { runMicrotasks } from "../test/util.js";

test("awaitNext(): complete chain", async () => {
	const cleanups: null[] = [];
	const promise = awaitNext<number>(o => {
		setTimeout(() => o.next?.(123), 50);
		return () => cleanups.push(null);
	});
	expect(promise).toBeInstanceOf(Promise);
	expect(await promise).toBe(123);
	expect(cleanups).toEqual([null]);
});
test("awaitNext(): error chain", async () => {
	const cleanups: null[] = [];
	const promise = awaitNext<number>(o => {
		setTimeout(() => o.error?.("Argh"), 50);
		return () => cleanups.push(null);
	});
	expect(promise).toBeInstanceOf(Promise);
	try {
		expect(await promise).toBe("Never");
	} catch (thrown) {
		expect(thrown).toBe("Argh");
	}
	expect(cleanups).toEqual([null]);
});
test("awaitComplete(): complete chain", async () => {
	const cleanups: null[] = [];
	const promise = awaitComplete<number>(o => {
		setTimeout(() => o.complete?.(), 50);
		return () => cleanups.push(null);
	});
	expect(promise).toBeInstanceOf(Promise);
	expect(await promise).toBe(undefined);
	expect(cleanups).toEqual([null]);
});
test("awaitComplete(): error chain", async () => {
	const cleanups: null[] = [];
	const promise = awaitComplete<number>(o => {
		setTimeout(() => o.error?.("Argh"), 50);
		return () => cleanups.push(null);
	});
	expect(promise).toBeInstanceOf(Promise);
	try {
		expect(await promise).toBe("Never");
	} catch (thrown) {
		expect(thrown).toBe("Argh");
	}
	expect(cleanups).toEqual([null]);
});
test("connectDerived(): works correctly", () => {
	const state = new Subject<number>();
	const derived = new Subject<number>();
	connectDerived(state, num => num * num, derived);
	const calls: number[] = [];
	derived.subscribe(v => calls.push(v));
	state.next(2);
	state.next(3);
	state.next(4);
	expect(calls).toEqual([4, 9, 16]);
});
test("connectAsyncDerived(): works correctly", async () => {
	const state = new Subject<number>();
	const derived = new Subject<number>();
	connectAsyncDerived(state, async num => num * (await Promise.resolve(num)), derived);
	const calls: number[] = [];
	derived.subscribe(v => calls.push(v));
	state.next(2);
	state.next(3);
	state.next(4);
	await runMicrotasks();
	expect(calls).toEqual([4, 9, 16]);
});
