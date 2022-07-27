import { Entity, getIDs } from "../util/data.js";
import { NotString } from "../util/string.js";

/** Run any queued microtasks now. */
export async function runMicrotasks(): Promise<void> {
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
}

/** Expect keys in any order. */
export function expectUnorderedKeys(entities: Iterable<Entity>, keys: Iterable<string> & NotString): void {
	try {
		expect(entities).toBeInstanceOf(Object);
		expect(Array.from(getIDs(entities)).sort()).toEqual(Array.from(keys).sort());
	} catch (thrown) {
		throw thrown instanceof Error ? popErrorStack(thrown) : thrown;
	}
}

/** Expect the specified keys in the specified order. */
export function expectOrderedKeys(entities: Iterable<Entity>, keys: Iterable<string> & NotString): void {
	try {
		expect(entities).toBeInstanceOf(Object);
		expect(Array.from(getIDs(entities))).toEqual(Array.from(keys));
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
