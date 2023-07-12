import type { MutableArray } from "../index.js";
import { DeferredSequence, STOP, combineSequences, getDeferred, repeatDelay, repeatUntil, runSequence } from "../index.js";

test("repeatUntil() and repeatDelay()", async () => {
	const yielded: number[] = [];
	const { promise, resolve } = getDeferred<typeof STOP>();
	for await (const count of repeatUntil(repeatDelay(50), promise)) {
		yielded.push(count);
		if (count >= 3) resolve(STOP);
	}
	expect(yielded).toEqual([1, 2, 3]);
});
describe("runSequence()", () => {
	test("runSequence() works correctly", async () => {
		const iterable: AsyncIterable<number> = {
			[Symbol.asyncIterator](): AsyncIterator<number> {
				let value = 0;
				return {
					next() {
						value++;
						if (value >= 3) return new Promise<IteratorResult<number>>(resolve => setTimeout(() => resolve({ done: true, value })));
						return new Promise<IteratorResult<number>>(resolve => setTimeout(() => resolve({ done: false, value })));
					},
				};
			},
		};
		const numbers: MutableArray<number> = [];
		const stop = runSequence(iterable, n => numbers.push(n));
		await new Promise(resolve => setTimeout(resolve, 1000));
		stop();
		expect(numbers).toEqual([1, 2]);
	});
	test("runSequence() errors correctly", async () => {
		const iterable: AsyncIterable<number> = {
			[Symbol.asyncIterator](): AsyncIterator<number> {
				let value = 0;
				return {
					next() {
						value++;
						if (value >= 4) return new Promise<IteratorResult<number>>(resolve => setTimeout(() => resolve({ done: true, value })));
						if (value >= 3) return Promise.reject(new Error("ERR"));
						return new Promise<IteratorResult<number>>(resolve => setTimeout(() => resolve({ done: false, value })));
					},
				};
			},
		};
		const numbers: MutableArray<number> = [];
		const errors: MutableArray<unknown> = [];
		const stop = runSequence(
			iterable,
			n => numbers.push(n),
			e => errors.push(e),
		);
		await new Promise(resolve => setTimeout(resolve, 1000));
		stop();
		expect(numbers).toEqual([1, 2]);
		expect(errors).toEqual([new Error("ERR")]);
	});
});
test("combineSequences()", async () => {
	const a = new DeferredSequence<number>();
	const b = new DeferredSequence<number>();
	const c = new DeferredSequence<number>();
	const yielded: number[] = [];
	setTimeout(() => {
		a.resolve(1);
	}, 50);
	setTimeout(() => {
		b.resolve(2);
	}, 100);
	setTimeout(() => {
		c.resolve(3);
	}, 150);
	setTimeout(() => {
		a.resolve(4);
	}, 200);
	setTimeout(() => {
		b.resolve(5);
	}, 250);
	setTimeout(() => {
		a.reject("Done"); // Reject one of the sequences or the loop would never end.
	}, 300);
	try {
		for await (const count of combineSequences(a, b, c)) {
			yielded.push(count);
		}
	} catch (err) {
		expect(err).toBe("Done");
	}
	expect(yielded).toEqual([1, 2, 3, 4, 5]);
});
