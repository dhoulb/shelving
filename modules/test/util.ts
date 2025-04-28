import { expect } from "bun:test";
import type { Data } from "../util/data.js";
import type { Item } from "../util/item.js";
import { getItemIDs } from "../util/item.js";
import type { NotString } from "../util/string.js";

/** Expect that an object matches `PromiseLike` */
export const EXPECT_PROMISELIKE = expect.objectContaining({
	// biome-ignore lint/suspicious/noThenProperty: On purpose.
	then: expect.any(Function),
});

/** Expect `Item` objects with an `.id` prop in any order. */
export function expectUnorderedItems<T extends Data>(items: Iterable<Item<T>>, keys: Iterable<string> & NotString): void {
	try {
		expect(items).toBeInstanceOf(Object);
		expect(Array.from(getItemIDs(items)).sort()).toEqual(Array.from(keys).sort());
	} catch (thrown) {
		if (thrown instanceof Error) Error.captureStackTrace(thrown, expectUnorderedItems);
		throw thrown;
	}
}

/** Expect `Item` objects with an `.id` prop in a specified order. */
export function expectOrderedItems<T extends Data>(items: Iterable<Item<T>>, keys: Iterable<string> & NotString): void {
	try {
		expect(items).toBeInstanceOf(Object);
		expect(Array.from(getItemIDs(items))).toEqual(Array.from(keys));
	} catch (thrown) {
		if (thrown instanceof Error) Error.captureStackTrace(thrown, expectOrderedItems);
		throw thrown;
	}
}
