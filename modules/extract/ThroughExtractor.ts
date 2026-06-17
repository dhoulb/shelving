import type { TreeElement } from "../util/tree.js";
import { Extractor } from "./Extractor.js";

/**
 * Base class for an extractor that wraps another extractor.
 * - Subclasses delegate to `source` and (optionally) transform the input before or the output after.
 * - Composes the same way `Through*Provider` chains do — chain multiple `ThroughExtractor`s to build up behaviour.
 *
 * @example new MergingExtractor(new DirectoryExtractor()) // a ThroughExtractor wrapping a source extractor
 * @see https://dhoulb.github.io/shelving/extract/ThroughExtractor/ThroughExtractor
 */
export abstract class ThroughExtractor<I, O extends TreeElement = TreeElement> extends Extractor<I, O> {
	/**
	 * The wrapped source extractor this through extractor delegates to.
	 * @see https://dhoulb.github.io/shelving/extract/ThroughExtractor/ThroughExtractor/source
	 */
	readonly source: Extractor<I, O>;

	/**
	 * Create a `ThroughExtractor` wrapping a source extractor.
	 *
	 * @param source The inner extractor to delegate to.
	 * @see https://dhoulb.github.io/shelving/extract/ThroughExtractor/ThroughExtractor
	 */
	constructor(source: Extractor<I, O>) {
		super();
		this.source = source;
	}

	/**
	 * Extract from the input by forwarding to `source.extract()`.
	 * - Default implementation is a pass-through; subclasses override to do work before or after.
	 *
	 * @param input The input value to extract from.
	 * @returns The extracted [`TreeElement`](/util/tree/TreeElement), or a promise resolving to one.
	 * @example await myThroughExtractor.extract(input)
	 * @see https://dhoulb.github.io/shelving/extract/ThroughExtractor/ThroughExtractor/extract
	 */
	extract(input: I): O | Promise<O> {
		return this.source.extract(input);
	}
}
