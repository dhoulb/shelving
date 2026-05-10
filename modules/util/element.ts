import { isArray } from "./array.js";

/** Set of valid props for an element. */
export interface ElementProps {
	readonly [key: string]: unknown;
	readonly children?: Elements;
}

/** Element with a type, props, and optional key (compatible with `React.ReactElement`). */
export interface Element<P extends ElementProps = ElementProps> {
	readonly type: string | ((props: P) => Elements | null);
	readonly props: P;
	readonly key: string | null;
	readonly $$typeof?: symbol;
}

/** Collection of elements (compatible with `React.ReactNode`). */
export type Elements = undefined | null | string | Element | readonly Elements[];

/** Is an unknown value an element? */
export function isElement(value: unknown): value is Element {
	return typeof value === "object" && value !== null && "type" in value;
}

/** Is an unknown value a collection of elements? */
export function isElements(value: unknown): value is Elements {
	return value === null || typeof value === "string" || isElement(value) || isArray(value);
}

/**
 * Strip all tags from elements to produce a plain text string.
 *
 * @param elements An element, a plain string, or null/undefined (or an array of those things).
 * @returns The combined string made from the elements.
 *
 * @example `- Item with *strong*\n- Item with _em_` becomes `Item with strong Item with em`
 */
export function getElementText(elements?: Elements): string {
	if (typeof elements === "string") return elements;
	if (isArray(elements)) return elements.map(getElementText).filter(Boolean).join(" ");
	if (isElement(elements)) return getElementText(elements.props.children);
	return "";
}

/**
 * Iterate through all elements in a collection.
 * - This is useful if you, e.g. want to apply a `className` to all `<h1>` elements, or make a list of all URLs found in a collection.
 */
export function* getElements(elements: Elements): Iterable<Element> {
	if (isArray(elements)) {
		for (const n of elements) yield* getElements(n);
	} else if (isElement(elements)) {
		yield elements;
		if (elements.props.children) yield* getElements(elements.props.children);
	}
}
