import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableDictionary, MutableDictionary } from "./dictionary.js";
import type { AnyCaller } from "./function.js";
import { isObject } from "./object.js";

/**
 * Log an error to the console.
 *
 * @param reason The error (or any thrown value) to log.
 * @returns Nothing.
 * @example logError(new Error("Boom")) // logs to console.error
 * @see https://dhoulb.github.io/shelving/util/error/logError
 */
export function logError(reason: unknown): void {
	console.error(reason);
}

/**
 * Is an unknown value an `Error` instance?
 * - Uses the native `Error.isError()` if available, otherwise falls back to `instanceof Error`.
 *
 * @param v The value to check and narrow.
 * @returns `true` if `v` is an `Error` (narrowing it, with an optional `code` string).
 * @see https://dhoulb.github.io/shelving/util/error/isError
 */
export function isError(v: unknown): v is Error & { readonly code?: string | undefined } {
	return typeof Error.isError === "function" ? Error.isError(v) : v instanceof Error;
}

/**
 * Things that can be a message: a string, or an object with a `message` string property.
 *
 * @see https://dhoulb.github.io/shelving/util/error/PossibleMessage
 */
export type PossibleMessage = { message: string } | string;

/**
 * Return the string message from an unknown value, or return `undefined` if it could not be found.
 *
 * @param input The value to read a message from (a string, or an object with a `message` string).
 * @returns The message string, or `undefined` if none could be found.
 * @example getMessage(new Error("Boom")) // "Boom"
 * @example getMessage(123) // undefined
 * @see https://dhoulb.github.io/shelving/util/error/getMessage
 */
export function getMessage(input: unknown): string | undefined {
	return typeof input === "string" ? input : isObject(input) && typeof input.message === "string" ? input.message : undefined;
}

/**
 * Require a message from an unknown value, or throw `RequiredError` if it could not be found.
 *
 * @param input The value to read a message from (a string, or an object with a `message` string).
 * @param caller Function to attribute a thrown error to (defaults to `requireMessage`).
 * @returns The message string.
 * @throws `RequiredError` if no message could be found.
 * @example requireMessage(new Error("Boom")) // "Boom"
 * @see https://dhoulb.github.io/shelving/util/error/requireMessage
 */
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
 *
 * @param input The value to read a message from (a string, or an object with a `message` string).
 * @returns Dictionary mapping each name (or `""` for unnamed lines) to its combined message.
 * @throws `RequiredError` if no message could be found.
 * @example splitMessage("name: Bad\nUh oh") // { name: "Bad", "": "Uh oh" }
 * @see https://dhoulb.github.io/shelving/util/error/splitMessage
 */
export function splitMessage(input: PossibleMessage): ImmutableDictionary<string> {
	const messages = requireMessage(input, splitMessage).split("\n");
	const output: MutableDictionary<string> = {};
	for (const line of messages) {
		const i = line.indexOf(": ");
		if (i >= 0) {
			const name = line.slice(0, i).trim();
			const message = line.slice(i + 2).trim();
			if (!message.length) continue;
			if (Object.hasOwn(output, name)) output[name] += `\n${message}`;
			else output[name] = message;
		} else {
			const message = line.trim();
			if (!message.length) continue;
			if (Object.hasOwn(output, "")) output[""] += `\n${message}`;
			else output[""] = message;
		}
	}
	return output;
}

/**
 * Join a dictionary of named messages back into a single string.
 * - The `""` (empty string) key is emitted as unnamed lines.
 * - Named messages are emitted as `name: message`, one line per message line.
 * - Empty lines are skipped and each emitted line is trimmed to match `splitMessage()` semantics.
 *
 * @param input Dictionary mapping each name (or `""` for unnamed lines) to its message.
 * @returns The combined message string, with one line per message line.
 * @example joinMessage({ name: "Bad", "": "Uh oh" }) // "name: Bad\nUh oh"
 * @see https://dhoulb.github.io/shelving/util/error/joinMessage
 */
export function joinMessage(input: ImmutableDictionary<string>): string {
	const output: string[] = [];
	for (const [name, message] of Object.entries(input)) {
		for (const line of message.split("\n")) {
			const value = line.trim();
			if (!value.length) continue;
			output.push(name ? `${name}: ${value}` : value);
		}
	}
	return output.join("\n");
}

/**
 * Name a message by applying a `name: ` prefix to it.
 * - Assumes each line in the message is a separate error, so each line has the same prefix applied.
 *
 * @param name The name to prefix each line of the message with.
 * @param message The message to prefix (may contain multiple `\n`-separated lines).
 * @returns The message with `name: ` prefixed to every line.
 * @example getNamedMessage("email", "Required\nInvalid") // "email: Required\nemail: Invalid"
 * @see https://dhoulb.github.io/shelving/util/error/getNamedMessage
 */
export function getNamedMessage(name: string | number, message: string): string {
	return `${name}: ${message.split("\n").join(`\n${name}: `)}`;
}
