import { isArray } from "./array.js";
import { isIterable } from "./iterate.js";
import type { Query } from "./query.js";
import { queryItems } from "./query.js";

/** Set of valid props for an element. */
export type ElementProps = {
	readonly children?: Elements;
};

/**
 * Element with a type, props, and optional key (compatible with `React.ReactElement`).
 * - Declared as a `type`, not an `interface`, so its implicit index signature lets it satisfy `Data` — `queryElements()` runs elements through `queryItems<T extends Data>`.
 */
export type Element<P extends ElementProps = ElementProps> = {
	readonly type: string | ((props: P) => Elements | null);
	readonly props: P;
	readonly key: string | null;
	readonly $$typeof?: symbol;
};

/** Collection of elements (compatible with `React.ReactNode`). */
export type Elements<T extends Element = Element> = undefined | null | string | T | Iterable<Elements<T>>;

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
 * - A `<br>` element becomes a newline (`\n`) — matching DOM `innerText`, so words either side of a line break don't fuse together.
 *
 * @param elements An element, a plain string, or null/undefined (or an array of those things).
 * @returns The combined string made from the elements.
 *
 * @example `- Item with *strong*\n- Item with _em_` becomes `Item with strong Item with em`
 */
export function getElementText(elements: Elements): string {
	if (typeof elements === "string") return elements;
	if (isElement(elements)) {
		// A `<br>` carries no children but renders as a line break — emit `\n` so adjacent words stay separated.
		if (elements.type === "br") return "\n";
		return getElementText(elements.props.children);
	}
	// Iterate the collection directly — `walkElements()` skips loose strings, so it would drop text that sits alongside elements.
	if (isIterable(elements)) {
		let text = "";
		for (const child of elements) text += getElementText(child);
		return text;
	}
	return "";
}

/**
 * Walk an `Elements` value into a flat iterable of `Element` objects.
 * - Accepts any shape the `Elements` union allows: a single element, a (possibly deeply nested) iterable, `null`, `undefined`, or a string (strings are skipped — there's no element to yield).
 * - Recurses through *iterable nesting* only (e.g. `[[a, b], c]` flattens to `a, b, c`); it does NOT descend into an element's own `props.children`. Walking deeper is the consumer's job.
 *
 * The point of this helper is to remove the "is it one element, a list, undefined, or some nested thing" branching from every consumer that needs to dispatch over elements — pass it in, get a clean flat iterable out.
 */
export function walkElements<T extends Element>(elements: Elements<T>): Iterable<T>;
export function walkElements(elements: Elements): Iterable<Element>;
export function* walkElements(elements: Elements): Iterable<Element> {
	if (isElement(elements)) yield elements;
	else if (isIterable(elements)) for (const x of elements) yield* walkElements(x);
}

/**
 * Filter elements yielded by `walkElements()` using a `Query<Element>` object.
 * - Supports any property query (e.g. `{ type: "tree-file" }`, `{ type: ["tree-file", "tree-directory"] }`), sorting, limiting — anything `queryItems()` accepts.
 */
export function queryElements(elements: Elements, query: Query<Element>): Iterable<Element> {
	return queryItems(walkElements(elements), query) as Iterable<Element>;
}

/** Filter elements yielded by `walkElements()` using a match function. */
export function* filterElements(elements: Elements, match: (element: Element) => boolean): Iterable<Element> {
	for (const element of walkElements(elements)) if (match(element)) yield element;
}

/** Combine two `Elements`, preserving both if both are set. */
export function mergeElements<T extends Element>(a: Elements<T>, b: Elements<T>): Elements<T>;
export function mergeElements(a: Elements, b: Elements): Elements;
export function mergeElements(a: Elements, b: Elements): Elements {
	if (!a) return b;
	if (!b) return a;
	return [a, b] as Elements;
}
