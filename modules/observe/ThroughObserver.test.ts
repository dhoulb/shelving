import { ConditionError, ThroughObserver } from "../index.js";

test("ThroughObserver: complete chain", () => {
	const nexts: number[] = [];
	const errors: unknown[] = [];
	const completes: null[] = [];
	const observer = new ThroughObserver<number>({ next: v => nexts.push(v), complete: () => completes.push(null), error: r => errors.push(r) });
	const cleanups: null[] = [];
	observer.connect(o => {
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
	observer.connect(o => {
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
