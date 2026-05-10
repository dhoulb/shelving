import type { ImmutableArray } from "./array.js";
import { isArray } from "./array.js";
import { isIterable } from "./iterate.js";
import type { AbsolutePath } from "./path.js";

// Base element types.

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

/** Widened input type that also accepts any `Iterable<Element>` (e.g. generators, Sets). */
export type PossibleElements = Elements | Iterable<Element>;

// Tree element types.

/** Props for a tree element — must have a `tree-` prefixed type. */
export interface TreeElementProps extends ElementProps {
	readonly title?: string | undefined;
	readonly description?: string | undefined;
	readonly content?: Elements | undefined;
}

/** Element in a tree with a `tree-` prefixed type string. */
export interface TreeElement<P extends TreeElementProps = TreeElementProps> extends Element<P> {
	readonly type: `tree-${string}`;
}

// Path element types.

/** Props for an element representing a file system path. */
export interface PathElementProps extends TreeElementProps {
	readonly path: AbsolutePath;
}

/** Element representing a file system path (file or directory). */
export interface PathElement<P extends PathElementProps = PathElementProps> extends TreeElement<P> {
	readonly type: "tree-directory" | "tree-file";
}

/** Props for a directory element. */
export interface DirectoryElementProps extends PathElementProps {
	readonly children?: Elements | undefined;
}

/**
 * Element representing a directory in a file tree.
 * - Content is absorbed from an index file (e.g. `README.md` or `INDEX.md`) if present.
 * - Children are the files and subdirectories within this directory.
 */
export interface DirectoryElement extends TreeElement<DirectoryElementProps> {
	readonly type: "tree-directory";
}

/** Props for a file element. */
export interface FileElementProps extends PathElementProps {
	readonly children?: Elements | undefined;
}

/**
 * Element representing a file in a file tree.
 * - For TypeScript files, children are the exported code symbols.
 * - For Markdown files, children are typically empty (content is the parsed markdown).
 */
export interface FileElement extends TreeElement<FileElementProps> {
	readonly type: "tree-file";
}

// Code element types.

/** A single parameter for a code symbol. */
export interface CodeParam {
	readonly name: string;
	readonly type?: string | undefined;
	readonly description?: string | undefined;
	readonly optional?: boolean | undefined;
}

/** Props shared by all code elements. */
export interface CodeElementProps extends TreeElementProps {
	readonly signature?: string | undefined;
	readonly params?: ImmutableArray<CodeParam> | undefined;
	readonly returns?: string | undefined;
	readonly examples?: ImmutableArray<string> | undefined;
}

/** Code element type discriminator. */
export type CodeElementType =
	| "tree-class"
	| "tree-function"
	| "tree-constant"
	| "tree-method"
	| "tree-property"
	| "tree-type"
	| "tree-interface";

/** Element representing a documented code symbol. */
export interface CodeElement<P extends CodeElementProps = CodeElementProps> extends TreeElement<P> {
	readonly type: CodeElementType;
}

/** Props for a class element. */
export interface ClassCodeElementProps extends CodeElementProps {
	readonly extends?: string | undefined;
	readonly implements?: ImmutableArray<string> | undefined;
	readonly children?: Elements | undefined;
}

/**
 * Element representing a class declaration.
 * - Children are the class's methods and properties.
 */
export interface ClassCodeElement extends CodeElement<ClassCodeElementProps> {
	readonly type: "tree-class";
}

/** Element representing a function declaration. */
export interface FunctionCodeElement extends CodeElement {
	readonly type: "tree-function";
}

/** Element representing a constant declaration. */
export interface ConstantCodeElement extends CodeElement {
	readonly type: "tree-constant";
}

/** Element representing a class method. */
export interface MethodCodeElement extends CodeElement {
	readonly type: "tree-method";
}

/** Element representing a class or interface property. */
export interface PropertyCodeElement extends CodeElement {
	readonly type: "tree-property";
}

/** Element representing a type alias. */
export interface TypeCodeElement extends CodeElement {
	readonly type: "tree-type";
}

/** Element representing an interface declaration. */
export interface InterfaceCodeElement extends CodeElement<ClassCodeElementProps> {
	readonly type: "tree-interface";
}

// IntrinsicElements declarations for tree-* custom elements.

declare module "react" {
	// biome-ignore lint/style/noNamespace: Required for JSX IntrinsicElements augmentation.
	namespace JSX {
		interface IntrinsicElements {
			"tree-directory": DirectoryElementProps;
			"tree-file": FileElementProps;
			"tree-class": ClassCodeElementProps;
			"tree-function": CodeElementProps;
			"tree-constant": CodeElementProps;
			"tree-method": CodeElementProps;
			"tree-property": CodeElementProps;
			"tree-type": CodeElementProps;
			"tree-interface": ClassCodeElementProps;
		}
	}
}

// Element utilities.

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
export function getElementText(elements?: PossibleElements): string {
	if (typeof elements === "string") return elements;
	if (isArray(elements)) return elements.map(getElementText).filter(Boolean).join(" ");
	if (isElement(elements)) return getElementText(elements.props.children);
	if (isIterable(elements))
		return [...elements]
			.map(el => getElementText(el))
			.filter(Boolean)
			.join(" ");
	return "";
}

/**
 * Iterate through all elements in a collection.
 * - Yields each `Element` found, recursing into `props.children` up to `depth` levels.
 * - `depth` controls how many levels of children to recurse into (default: infinite).
 * - `depth=0` yields elements at the current level only (no recursion into children).
 */
export function* getElements(elements: PossibleElements, depth?: number): Iterable<Element> {
	if (isElement(elements)) {
		yield elements;
		if (depth !== 0 && elements.props.children) yield* getElements(elements.props.children, depth !== undefined ? depth - 1 : undefined);
	} else if (isIterable(elements)) {
		for (const el of elements) yield* getElements(el, depth);
	}
}

/**
 * Deeply query elements, filtering by a match function and recursing into children up to `depth` levels.
 * - Returns a new `Elements` collection containing only elements whose `type` matches.
 * - Children of matching elements are recursively filtered.
 * - If `depth` is unset, recursion is infinite.
 *
 * @param elements The elements to query.
 * @param match Function that tests whether an element should be included.
 * @param depth Maximum depth to recurse (0 = top level only, undefined = infinite).
 */
export function queryElements(elements: PossibleElements, match: (element: Element) => boolean, depth?: number): Elements {
	if (!elements) return elements as Elements;
	if (typeof elements === "string") return elements;
	if (!isElement(elements) && !isArray(elements)) {
		// Normalize non-array iterables to arrays.
		return isIterable(elements) ? queryElements([...elements], match, depth) : undefined;
	}
	if (isArray(elements)) {
		const results = elements.map(n => queryElements(n, match, depth)).filter(Boolean);
		return results.length ? results : undefined;
	}
	if (isElement(elements)) {
		if (!match(elements)) return undefined;
		if (depth === 0 || !elements.props.children) return elements;
		const children = queryElements(elements.props.children, match, depth !== undefined ? depth - 1 : undefined);
		return children !== elements.props.children ? { ...elements, props: { ...elements.props, children } } : elements;
	}
	return undefined;
}

/**
 * Deeply iterate a tree of elements and yield the absolute path for each element that has a string `key`.
 * - Paths are formed by concatenating `key` values with `/` separators.
 */
export function* getElementPaths(elements: PossibleElements, prefix = ""): Iterable<AbsolutePath> {
	for (const element of getElements(elements)) {
		const { key } = element;
		if (!key) continue;
		const path = `${prefix}/${key}` as AbsolutePath;
		yield path;
		if (element.props.children) yield* getElementPaths(element.props.children, path);
	}
}
