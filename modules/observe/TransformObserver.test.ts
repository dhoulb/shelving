import { ConditionError, TransformObserver } from "../index.js";

test("TransformObserver: complete chain", () => {
	const nexts: string[] = [];
	const errors: unknown[] = [];
	const completes: null[] = [];
	const observer = new TransformObserver<number, string>(n => (n * n).toString(), {
		next: v => nexts.push(v),
		complete: () => completes.push(null),
		error: r => errors.push(r),
	});
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
	expect(nexts).toEqual(["1", "4", "9"]);
	expect(completes).toEqual([null]);
	expect(errors).toEqual([]);
	expect(cleanups).toEqual([null]);
});
