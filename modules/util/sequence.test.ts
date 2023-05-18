import type { MutableArray } from "../index.js";
import { Signal, repeatDelay, repeatUntil, runSequence } from "../index.js";

test("repeatUntil() and repeatDelay()", async () => {
	const yielded: number[] = [];
	const stop = new Signal();
	for await (const count of repeatUntil(repeatDelay(50), stop)) {
		yielded.push(count);
		if (count >= 3) stop.send();
	}
	expect(yielded).toEqual([1, 2, 3]);
});
describe("", () => {
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
