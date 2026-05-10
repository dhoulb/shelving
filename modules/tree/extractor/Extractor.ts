import type { Element } from "../../util/element.js";

/**
 * Base interface for an extractor that converts input into an element.
 * - Extractors are composable: outer extractors delegate to inner extractors.
 */
export interface Extractor<I> {
	/** Extract an element from the given input. */
	extract(input: I): Element | Promise<Element>;
}

/** Extractor that converts string content into an element. */
export type ContentExtractor = Extractor<string>;
