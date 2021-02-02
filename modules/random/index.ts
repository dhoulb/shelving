/**
 * Make a random ID for a document, e.g. "xs23rsdxe4mrugef"
 * - Not designed to be cryptographically random!
 * - Will probably clash — if you're making a random ID, check for existence of the record before saving.
 */
export const randomId = (): string => Math.random().toString(34).substr(2, 8) + Math.random().toString(34).substr(2, 8);
