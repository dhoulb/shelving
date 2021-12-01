import { ConditionError, OnceObserver, ThroughObserver, DeriveObserver, awaitNext, NOVALUE, awaitComplete } from "../index.js";

test("ThroughObserver: complete chain", () => {
	const nexts: number[] = [];
	const errors: unknown[] = [];
	const completes: null[] = [];
	const observer = new ThroughObserver<number>({ next: v => nexts.push(v), complete: () => completes.push(null), error: r => errors.push(r) });
	const cleanups: null[] = [];
	observer.from(o => {
		expect(o).toBe(observer);
		return () => cleanups.push(null);
	});
	observer.next(1);
	observer.next(2);
	observer.next(3);
	expect(observer.closed).toBe(false);
	observer.complete();
	expect(observer.closed).toBe(true);
	expect(() => observer.next(999)).toThrow(ConditionError);
	expect(() => observer.error("Nargh")).toThrow(ConditionError);
	expect(() => observer.complete()).toThrow(ConditionError);
	expect(nexts).toEqual([1, 2, 3]);
	expect(completes).toEqual([null]);
	expect(errors).toEqual([]);
	expect(cleanups).toEqual([null]);
});
test("ThroughObserver: error chain", () => {
	const nexts: number[] = [];
	const errors: unknown[] = [];
	const completes: null[] = [];
	const observer = new ThroughObserver<number>({ next: v => nexts.push(v), complete: () => completes.push(null), error: r => errors.push(r) });
	const cleanups: null[] = [];
	observer.from(o => {
		expect(o).toBe(observer);
		return () => cleanups.push(null);
	});
	observer.next(1);
	observer.next(2);
	observer.next(3);
	expect(observer.closed).toBe(false);
	observer.error("Argh");
	expect(observer.closed).toBe(true);
	expect(() => observer.next(999)).toThrow(ConditionError);
	expect(() => observer.error("Nargh")).toThrow(ConditionError);
	expect(() => observer.complete()).toThrow(ConditionError);
	expect(nexts).toEqual([1, 2, 3]);
	expect(completes).toEqual([]);
	expect(errors).toEqual(["Argh"]);
	expect(cleanups).toEqual([null]);
});
test("OnceObserver", () => {
	const nexts: number[] = [];
	const errors: unknown[] = [];
	const completes: null[] = [];
	const observer = new OnceObserver<number>({ next: v => nexts.push(v), complete: () => completes.push(null), error: r => errors.push(r) });
	const cleanups: null[] = [];
	observer.from(o => {
		expect(o).toBe(observer);
		return () => cleanups.push(null);
	});
	expect(observer.closed).toBe(false);
	observer.next(1);
	expect(observer.closed).toBe(true);
	expect(() => observer.next(999)).toThrow(ConditionError);
	expect(() => observer.error("Nargh")).toThrow(ConditionError);
	expect(() => observer.complete()).toThrow(ConditionError);
	expect(nexts).toEqual([1]);
	expect(completes).toEqual([null]);
	expect(errors).toEqual([]);
	expect(cleanups).toEqual([null]);
});
test("DeriveObserver: complete chain", () => {
	const nexts: string[] = [];
	const errors: unknown[] = [];
	const completes: null[] = [];
	const observer = new DeriveObserver<number, string>(n => (n * n).toString(), {
		next: v => nexts.push(v),
		complete: () => completes.push(null),
		error: r => errors.push(r),
	});
	const cleanups: null[] = [];
	observer.from(o => {
		expect(o).toBe(observer);
		return () => cleanups.push(null);
	});
	observer.next(1);
	observer.next(2);
	observer.next(3);
	expect(observer.closed).toBe(false);
	observer.complete();
	expect(observer.closed).toBe(true);
	expect(() => observer.next(999)).toThrow(ConditionError);
	expect(() => observer.error("Nargh")).toThrow(ConditionError);
	expect(() => observer.complete()).toThrow(ConditionError);
	expect(nexts).toEqual(["1", "4", "9"]);
	expect(completes).toEqual([null]);
	expect(errors).toEqual([]);
	expect(cleanups).toEqual([null]);
});
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
		expect(await promise).toBe(NOVALUE);
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
		expect(await promise).toBe(NOVALUE);
	} catch (thrown) {
		expect(thrown).toBe("Argh");
	}
	expect(cleanups).toEqual([null]);
});
