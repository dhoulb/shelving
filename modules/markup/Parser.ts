/**
 * Base class for a parser that converts an input of type `I` into an output of type `O`.
 * - Subclasses implement `parse()` to define the actual transformation.
 * - `MarkupParser` is the canonical implementation — it parses a markup string into a React node.
 *
 * @example
 * class UppercaseParser extends Parser<string, string> {
 * 	parse(input: string): string { return input.toUpperCase(); }
 * }
 * @see https://shelving.cc/markup/Parser
 */
export abstract class Parser<I, O> {
	/**
	 * Parse an input value into an output value.
	 *
	 * @param input The input value to parse.
	 * @returns The parsed output value.
	 * @see https://shelving.cc/markup/Parser/parse
	 */
	abstract parse(input: I): O;
}
