import type { TreeElement } from "../util/element.js";
import { Extractor } from "./Extractor.js";

/**
 * Base class for an extractor that wraps another extractor.
 * - Subclasses delegate to `source` and (optionally) transform the input before or the output after.
 * - Composes the same way `Through*Provider` chains do — chain multiple `ThroughExtractor`s to build up behaviour.
 */
export abstract class ThroughExtractor<I, O extends TreeElement = TreeElement> extends Extractor<I, O> {
	readonly source: Extractor<I, O>;

	constructor(source: Extractor<I, O>) {
		super();
		this.source = source;
	}

	/** Default implementation forwards to `source.extract()`. Subclasses override to do work before or after. */
	extract(input: I): O | Promise<O> {
		return this.source.extract(input);
	}
}
