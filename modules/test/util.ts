import type { Data } from "../util/data.js";
import type { AnyFunction } from "../util/function.js";
import type { ItemData } from "../util/item.js";
import type { NotString } from "../util/string.js";
import { expect } from "@jest/globals";
import { getItemIDs } from "../util/item.js";

/** Match any `Promiselike` object. */
export const PromiseLike = expect.objectContaining({
	then: expect.any(Function),
});

/** Expect the thing to throw a `PromiseLike` object. */
export function expectToThrowPromiseLike(func: AnyFunction) {
	try {
		func();
	} catch (thrown) {
		expect(thrown).toMatchObject(PromiseLike);
		return;
	}
	throw popErrorStack(new Error("Expected to throw but did not"));
}

/** Expect the thing to throw an object matching the specified one. */
export function expectToThrowMatchObject(func: AnyFunction, obj: Record<string, unknown> | Array<Record<string, unknown>>): void {
	try {
		func();
	} catch (thrown) {
		expect(thrown).toMatchObject(obj);
		return;
	}
	throw popErrorStack(new Error("Expected to throw but did not"));
}

/** Expect keys in any order. */
export function expectUnorderedKeys<T extends Data>(entities: Iterable<ItemData<T>>, keys: Iterable<string> & NotString): void {
	try {
		expect(entities).toBeInstanceOf(Object);
		expect(Array.from(getItemIDs(entities)).sort()).toEqual(Array.from(keys).sort());
	} catch (thrown) {
		throw thrown instanceof Error ? popErrorStack(thrown) : thrown;
	}
}

/** Expect the specified keys in the specified order. */
export function expectOrderedKeys<T extends Data>(entities: Iterable<ItemData<T>>, keys: Iterable<string> & NotString): void {
	try {
		expect(entities).toBeInstanceOf(Object);
		expect(Array.from(getItemIDs(entities))).toEqual(Array.from(keys));
	} catch (thrown) {
		throw thrown instanceof Error ? popErrorStack(thrown) : thrown;
	}
}

/** Pop a number of items off an error stack. */
function popErrorStack(error: Error, count = 1): Error {
	const { name, message, stack } = error;
	if (stack) {
		const prefix = message ? `${name}: ${message}\n` : `${name}\n`;
		if (stack.startsWith(prefix)) {
			// In Chrome and Node the name and message of the error is the first line of the stack (so we need to skip over the first line).
			const lines = stack.slice(prefix.length).split("\n");
			lines.splice(0, count);
			error.stack = prefix + lines.join("\n");
		} else {
			// In Firefox and Safari the stack starts straight away.
			const lines = stack.split("\n");
			lines.splice(0, count);
			error.stack = lines.join("\n");
		}
	}
	return error;
}
