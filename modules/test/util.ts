import { expect } from "bun:test";
import type { Data } from "../util/data.js";
import type { Identifier, Item } from "../util/item.js";
import { getIdentifiers } from "../util/item.js";
import type { NotString } from "../util/string.js";

/** Expect that an object matches `PromiseLike` */
export const EXPECT_PROMISELIKE = expect.objectContaining({
	// biome-ignore lint/suspicious/noThenProperty: On purpose.
	then: expect.any(Function),
});

/** Expect `Item` objects with an `.id` prop in any order. */
export function expectUnorderedItems<I extends Identifier, T extends Data>(
	items: Iterable<Item<I, T>>,
	keys: Iterable<string> & NotString,
): void {
	try {
		expect(items).toBeInstanceOf(Object);
		expect(Array.from(getIdentifiers(items)).sort()).toEqual(Array.from(keys).sort() as I[]);
	} catch (thrown) {
		if (thrown instanceof Error) Error.captureStackTrace(thrown, expectUnorderedItems);
		throw thrown;
	}
}

/** Expect `Item` objects with an `.id` prop in a specified order. */
export function expectOrderedItems<I extends Identifier, T extends Data>(
	items: Iterable<Item<I, T>>,
	keys: Iterable<string> & NotString,
): void {
	try {
		expect(items).toBeInstanceOf(Object);
		expect(Array.from(getIdentifiers(items))).toEqual(Array.from(keys) as I[]);
	} catch (thrown) {
		if (thrown instanceof Error) Error.captureStackTrace(thrown, expectOrderedItems);
		throw thrown;
	}
}
