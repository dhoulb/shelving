/** biome-ignore-all lint/suspicious/useAwait: False positive for async iterators. */

import { describe, expect, test } from "bun:test";
import type { MutableArray } from "../index.js";
import { getDeferred, mergeSequences, repeatDelay, repeatUntil, runSequence, STOP } from "../index.js";

const DELAY = 50;

test("repeatUntil() and repeatDelay()", async () => {
	const yielded: number[] = [];
	const { promise, resolve } = getDeferred<typeof STOP>();
	for await (const count of repeatUntil(repeatDelay(DELAY), promise)) {
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
		await new Promise(resolve => setTimeout(resolve, DELAY));
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
		await new Promise(resolve => setTimeout(resolve, DELAY));
		stop();
		expect(numbers).toEqual([1, 2]);
		expect(errors).toEqual([new Error("ERR")]);
	});
});
describe("mergeSequences()", () => {
	// Helper to convert async iterable to array
	async function toArray<T>(sequence: AsyncIterable<T>): Promise<T[]> {
		const result: T[] = [];
		for await (const item of sequence) {
			result.push(item);
		}
		return result;
	}

	// Helper to create async generator from array
	async function* fromArray<T>(items: T[]): AsyncIterable<T> {
		for (const item of items) {
			yield item;
		}
	}

	test("merges multiple sequences in order", async () => {
		const seq1 = fromArray([1, 2, 3]);
		const seq2 = fromArray([4, 5, 6]);
		const seq3 = fromArray([7, 8, 9]);

		const result = await toArray(mergeSequences(seq1, seq2, seq3));

		expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});

	test("handles empty sequences", async () => {
		const seq1 = fromArray([1, 2]);
		const seq2 = fromArray([]);
		const seq3 = fromArray([3, 4]);

		const result = await toArray(mergeSequences(seq1, seq2, seq3));

		expect(result).toEqual([1, 2, 3, 4]);
	});
	test("handles no sequences", async () => {
		const emptyseq = fromArray([]);

		const result = await toArray(mergeSequences(emptyseq));

		expect(result).toEqual([]);
	});
});
