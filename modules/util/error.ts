/** Log an error to the console. */
export function logError(reason: unknown): void {
	console.error(reason);
}

/** Is an unknown value an `Error` instance? */
export function isError(v: unknown): v is Error & { readonly code?: string | undefined } {
	return typeof Error.isError === "function" ? Error.isError(v) : v instanceof Error;
}

/**
 * Extract the _main message(s)_ from a full error message string.
 *
 * - Error messages can have multiple lines separated by `\n` newline.
 * - Some lines may be _named messages_ in `name: This is a message` format.
 * - The _main_ message is any line(s) that is not a named message.
 *
 * @returns The combined main message(s) found in the full message string.
 */
export function getMainMessage(fullMessage: string): string {
	let propMessages = "";
	for (const [foundMessage] of fullMessage.matchAll(/^\s*(?!.*: )(.*?)\s*/g))
		if (foundMessage) propMessages = propMessages ? `${propMessages}\n${foundMessage}` : foundMessage;
	return propMessages;
}

/**
 * Extract the _named message(s)_ from a full error message string.
 *
 * - Error messages can have multiple lines separated by `\n` newline.
 * - Some lines may be _named messages_ in `name: This is a message` format.
 * - This function extracts any `name: This is a message` lines from the full message string.
 * - Note there may be multiple lines starting with `name:` (in the case where there were multiple errors with that name).
 * - This trims the `name: ` prefix from found messages and rejoins them with `\n` newline.
 *
 * @param fullMessage The full message string which may contain named messages in `name: This is a message` format.
 * @param name The name of the prop to extract the message for.
 *
 * @returns The combined message(s) for the named prop found in the full message string, or an empty string if no messages were found for that prop.
 */
export function getNamedMessage(fullMessage: string, name: string | number): string {
	let namedMessages = "";
	for (const [foundMessage] of fullMessage.matchAll(new RegExp(`^${name}: \s*(.*?)\s*$`, "g")))
		if (foundMessage) namedMessages = namedMessages ? `${namedMessages}\n${foundMessage}` : foundMessage;
	return namedMessages;
}
