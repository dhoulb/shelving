import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableDictionary, MutableDictionary } from "./dictionary.js";
import type { AnyCaller } from "./function.js";
import { isObject } from "./object.js";

/** Log an error to the console. */
export function logError(reason: unknown): void {
	console.error(reason);
}

/** Is an unknown value an `Error` instance? */
export function isError(v: unknown): v is Error & { readonly code?: string | undefined } {
	return typeof Error.isError === "function" ? Error.isError(v) : v instanceof Error;
}

/** Things that can be a message. */
export type PossibleMessage = { message: string } | string;

/** Return the string message from an unknown value, or return `undefined` if it could not be found. */
export function getMessage(input: unknown): string | undefined {
	return typeof input === "string" ? input : isObject(input) && typeof input.message === "string" ? input.message : undefined;
}

/** Require a message from an unknown value, or throw `RequiredError` if it could not be found. */
export function requireMessage(input: PossibleMessage, caller: AnyCaller = requireMessage): string {
	const message = getMessage(input);
	if (message === undefined) throw new RequiredError("Message is required", { received: input, caller });
	return message;
}

/**
 * Split a string message into lines, look for prefixes like `name:`, and return a dictionary of those named messages.
 * - Full messages strings can have multiple lines separated by `\n` newline.
 * - Named messages are extracted into their own entries in the dictionary.
 * - Unnamed messages are combined into a single entry with the key `""` (empty string).
 */
export function splitMessage(input: PossibleMessage): ImmutableDictionary<string> {
	const messages = requireMessage(input, splitMessage).split("\n");
	const output: MutableDictionary<string> = {};
	for (const line of messages) {
		const i = line.indexOf(": ");
		if (i >= 0) {
			const name = line.slice(0, i).trim();
			const message = line.slice(i + 2).trim();
			if (Object.hasOwn(output, name)) output[name] += `\n${message}`;
			else output[name] = message;
		} else {
			const message = line.trim();
			if (Object.hasOwn(output, "")) output[""] += `\n${message}`;
			else output[""] = message;
		}
	}
	return output;
}

/**
 * Name a message by applying a `name: ` prefix to it.
 * - Assumes each line in the message is a separate error, so each line has the same prefix applied.
 */
export function getNamedMessage(name: string, message: string): string {
	return `${name}: ${message.split("\n").join(`\n${name}: `)}`;
}
