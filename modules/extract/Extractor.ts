import type { Element } from "../util/element.js";

/**
 * Base class for an extractor that converts input into an element.
 * - Extractors are composable: outer extractors delegate to inner extractors.
 */
export abstract class Extractor<I> {
	/** Extract an element from the given input. */
	abstract extract(input: I): Element | Promise<Element>;
}

/** Extractor that converts string content into an element. */
export type ContentExtractor = Extractor<string>;
