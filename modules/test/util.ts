import { expect } from "bun:test";
import type { Data } from "../util/data.js";
import type { Identifier, Item } from "../util/item.js";
import { getIdentifiers } from "../util/item.js";
import type { NotString } from "../util/string.js";

/**
 * Asymmetric matcher that expects an object matching `PromiseLike` (i.e. has a `.then()` method).
 *
 * @example expect(value).toEqual(EXPECT_PROMISELIKE)
 * @see https://shelving.cc/test/EXPECT_PROMISELIKE
 */
export const EXPECT_PROMISELIKE = expect.objectContaining({
	then: expect.any(Function),
});

/**
 * Assert that a set of `Item` objects has exactly the expected `.id` values, in any order.
 *
 * - Sorts both sides before comparing, so iteration order is ignored.
 * - On failure, rewrites the stack trace to point at the call site.
 *
 * @param items The items to check, each carrying an `.id` prop.
 * @param keys The exact set of `.id` values expected (order ignored).
 * @throws {Error} If the items' ids don't match `keys`.
 * @see https://shelving.cc/test/expectUnorderedItems
 */
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

/**
 * Assert that a set of `Item` objects has exactly the expected `.id` values, in the exact given order.
 *
 * - Compares ids positionally, so order is significant.
 * - On failure, rewrites the stack trace to point at the call site.
 *
 * @param items The items to check, each carrying an `.id` prop.
 * @param keys The exact ordered sequence of `.id` values expected.
 * @throws {Error} If the items' ids don't match `keys` in order.
 * @see https://shelving.cc/test/expectOrderedItems
 */
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
