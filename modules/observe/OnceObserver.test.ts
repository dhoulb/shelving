import { ConditionError, OnceObserver, ThroughObserver, TransformObserver, awaitNext, NOVALUE, awaitComplete } from "../index.js";

test("OnceObserver", () => {
	const nexts: number[] = [];
	const errors: unknown[] = [];
	const completes: null[] = [];
	const observer = new OnceObserver<number>({ next: v => nexts.push(v), complete: () => completes.push(null), error: r => errors.push(r) });
	const cleanups: null[] = [];
	observer.connect(o => {
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
