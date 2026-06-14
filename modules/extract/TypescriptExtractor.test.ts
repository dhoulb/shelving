import { describe, expect, test } from "bun:test";
import type { BunFile } from "bun";
import { TypescriptExtractor } from "./index.js";

const extractor = new TypescriptExtractor();

/**
 * Make a fake `BunFile` for unit tests.
 * - Web `File` has the same `.name` and `.text()` behaviour the extractor needs.
 * - The extra `BunFile`-only methods (`writer`, `exists`, etc.) aren't touched by the extractor.
 */
function file(source: string, name = "/tmp/source.ts"): BunFile {
	return new File([source], name) as unknown as BunFile;
}

describe("TypescriptExtractor", () => {
	test("extracts exported function", async () => {
		const element = await extractor.extract(
			file(`
/** Add two numbers together. */
export function add(a: number, b: number): number {
	return a + b;
}
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: {
					kind: "function",
					name: "add",
					title: "add()",
					content: "Add two numbers together.",
					signatures: ["add(a: number, b: number): number"],
				},
			},
		]);
	});

	test("extracts exported constant", async () => {
		const element = await extractor.extract(
			file(`
/** Maximum retry count. */
export const MAX_RETRIES: number = 3;
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: { kind: "constant", name: "MAX_RETRIES", title: "MAX_RETRIES", signatures: ["MAX_RETRIES: number"] },
			},
		]);
	});

	test("extracts exported class with members", async () => {
		const element = await extractor.extract(
			file(`
/** A simple store. */
export class Store {
	/** Current value. */
	value: string;
	/** Update the value. */
	set(v: string): void {}
	private _internal(): void {}
}
`),
		);
		const children = element.props.children as unknown[];
		expect(children).toHaveLength(1);
		const cls = children[0] as { type: string; props: { kind: string; name: string; title: string; children: unknown[] } };
		expect(cls.type).toBe("tree-documentation");
		expect(cls.props.kind).toBe("class");
		expect(cls.props.name).toBe("Store");
		expect(cls.props.title).toBe("Store");
		expect(cls.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: { kind: "property", name: "value", title: "value", class: "Store", signatures: ["value: string"] },
			},
			{ type: "tree-documentation", props: { kind: "method", name: "set", title: "set()", class: "Store" } },
		]);
	});

	test("extracts exported interface", async () => {
		const element = await extractor.extract(
			file(`
/** Options for the thing. */
export interface ThingOptions {
	/** Whether to be verbose. */
	verbose?: boolean;
}
`),
		);
		expect(element.props.children).toMatchObject([
			{ type: "tree-documentation", props: { kind: "interface", name: "ThingOptions", title: "ThingOptions" } },
		]);
	});

	test("extracts exported type alias", async () => {
		const element = await extractor.extract(
			file(`
/** A nullable string. */
export type NullableString = string | null;
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: { kind: "type", name: "NullableString", title: "NullableString", signatures: ["string | null"] },
			},
		]);
	});

	test("skips non-exported declarations", async () => {
		const element = await extractor.extract(
			file(`
function internal(): void {}
export function external(): void {}
`),
		);
		const children = element.props.children as unknown[];
		expect(children).toHaveLength(1);
	});

	test("skips _-prefixed declarations", async () => {
		const element = await extractor.extract(
			file(`
export function _helper(): void {}
export function publicFn(): void {}
`),
		);
		const children = element.props.children as unknown[];
		expect(children).toHaveLength(1);
	});

	test("skips private and protected class members", async () => {
		const element = await extractor.extract(
			file(`
export class Foo {
	public bar: string;
	private _baz: string;
	protected _qux: string;
}
`),
		);
		const cls = (element.props.children as unknown[])[0] as { props: { children: unknown[] } };
		expect(cls.props.children).toHaveLength(1);
	});

	test("extracts file-level JSDoc comment as content", async () => {
		const element = await extractor.extract(
			file(`
/**
 * This module handles array utilities.
 */
export function first<T>(arr: T[]): T | undefined {
	return arr[0];
}
`),
		);
		expect(element.props.content).toBe("This module handles array utilities.");
	});

	test("leaves the file element title undefined (no confident source for a TS source file)", async () => {
		const element = await extractor.extract(file("export const X = 1;", "/tmp/array.ts"));
		expect(element.props.title).toBeUndefined();
		expect(element.props.name).toBe("array");
		expect(element.key).toBe("array.ts");
	});

	test("sets title with () for functions and methods, bare name for other kinds", async () => {
		const element = await extractor.extract(
			file(`
/** A function. */
export function doThing(): void {}
/** A constant. */
export const VALUE = 1;
/** A type. */
export type Thing = string;
/** A class. */
export class Widget {
	/** A property. */
	size: number;
	/** A method. */
	resize(): void {}
}
`),
		);
		expect(element.props.children).toMatchObject([
			{ props: { kind: "function", name: "doThing", title: "doThing()" } },
			{ props: { kind: "constant", name: "VALUE", title: "VALUE" } },
			{ props: { kind: "type", name: "Thing", title: "Thing" } },
			{
				props: {
					kind: "class",
					name: "Widget",
					title: "Widget",
					children: [
						{ props: { kind: "property", name: "size", title: "size" } },
						{ props: { kind: "method", name: "resize", title: "resize()" } },
					],
				},
			},
		]);
	});

	test("extracts extends and implements from a class declaration", async () => {
		const element = await extractor.extract(
			file(`
/** A concrete store. */
export class MemoryStore extends AbstractStore implements Serializable, Disposable {
	value: string;
}
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: { kind: "class", name: "MemoryStore", extends: "AbstractStore", implements: ["Serializable", "Disposable"] },
			},
		]);
	});

	test("stamps the owning class onto members and skips `override` members", async () => {
		const element = await extractor.extract(
			file(`
/** A store. */
export class MemoryStore extends AbstractStore {
	/** The current value. */
	readonly value: string;
	/** Get a thing. */
	override get(): string { return ""; }
	/** Override a property. */
	override readonly size: number;
}
`),
		);
		const cls = (element.props.children as { props: { children: { props: Record<string, unknown> }[] } }[])[0];
		// Only the directly-implemented `value` survives — `get()` and `size` carry `override` and are documented on the base class.
		expect(cls?.props.children).toMatchObject([
			{ props: { kind: "property", name: "value", title: "value", class: "MemoryStore", readonly: true } },
		]);
		expect(cls?.props.children).toHaveLength(1);
	});

	test("treats a getter without a setter as readonly, and a getter+setter pair as writable", async () => {
		const element = await extractor.extract(
			file(`
/** A store. */
export class Store {
	/** Read-only size. */
	get size(): number { return 0; }
	/** Writable name. */
	get name(): string { return ""; }
	set name(v: string) {}
}
`),
		);
		const cls = (element.props.children as { props: { children: { props: Record<string, unknown> }[] } }[])[0];
		expect(cls?.props.children).toMatchObject([
			{
				props: {
					kind: "property",
					name: "size",
					title: "size",
					class: "Store",
					readonly: true,
					signatures: ["readonly size: number"],
				},
			},
			{ props: { kind: "property", name: "name", title: "name", class: "Store", signatures: ["name: string"] } },
		]);
		// The getter+setter pair must NOT be flagged readonly.
		expect((cls?.props.children[1]?.props as { readonly?: boolean }).readonly).toBeUndefined();
	});

	test("merges overloaded function declarations into one element with multiple signatures", async () => {
		const element = await extractor.extract(
			file(`
/** Add two values. */
export function add(a: number, b: number): number;
export function add(a: string, b: string): string;
export function add(a: any, b: any): any { return a + b; }
`),
		);
		const children = element.props.children as unknown[];
		expect(children).toHaveLength(1);
		expect(children[0]).toMatchObject({
			type: "tree-documentation",
			props: {
				name: "add",
				title: "add()",
				kind: "function",
				signatures: ["add(a: number, b: number): number", "add(a: string, b: string): string", "add(a: any, b: any): any"],
			},
		});
	});

	test("skips `declare` members (ambient type-only re-declarations)", async () => {
		const element = await extractor.extract(
			file(`
/** A typed schema. */
export class BooleanSchema extends Schema {
	/** Narrowed value type. */
	declare readonly value: boolean;
	/** A real new method. */
	check(): boolean { return true; }
}
`),
		);
		const cls = (element.props.children as { props: { children: { props: Record<string, unknown> }[] } }[])[0];
		// The `declare` field is omitted; only the genuinely-new `check()` survives.
		expect(cls?.props.children).toMatchObject([{ props: { kind: "method", name: "check", title: "check()" } }]);
		expect(cls?.props.children).toHaveLength(1);
	});

	test("keeps case-distinct exports separate (Class vs FACTORY) with case-preserving keys", async () => {
		// `Collection` and `COLLECTION` differ only in case — they must not collapse into one entity.
		const element = await extractor.extract(
			file(`
/** A collection. */
export class Collection {
	name: string;
}
/** Make a collection. */
export function COLLECTION(): Collection { return new Collection(); }
`),
		);
		const children = element.props.children as { key: string; props: { name: string; kind: string } }[];
		expect(children).toHaveLength(2);
		expect(children.map(c => c.key)).toEqual(["Collection", "COLLECTION"]);
		expect(children.map(c => c.props.name)).toEqual(["Collection", "COLLECTION"]);
		expect(children.map(c => c.props.kind)).toEqual(["class", "function"]);
	});

	test("synthesises a `new ClassName(...)` constructor signature, params, and returns for a simple class", async () => {
		const element = await extractor.extract(
			file(`
/** A boolean schema. */
export class BooleanSchema {
	constructor(options: BooleanSchemaOptions) {}
}
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: {
					kind: "class",
					name: "BooleanSchema",
					signatures: ["new BooleanSchema(options: BooleanSchemaOptions)"],
					params: [{ name: "options", type: "BooleanSchemaOptions", description: undefined, optional: false }],
					returns: [{ type: "BooleanSchema", description: undefined }],
				},
			},
		]);
	});

	test("includes generics in the constructor signature and returns type", async () => {
		const element = await extractor.extract(
			file(`
/** A mock API provider. */
export class MockAPIProvider<P, R> {
	constructor(handler: RequestHandler, source: APIProvider<P, R>) {}
}
`),
		);
		expect(element.props.children).toMatchObject([
			{
				props: {
					kind: "class",
					name: "MockAPIProvider",
					signatures: ["new MockAPIProvider<P, R>(handler: RequestHandler, source: APIProvider<P, R>)"],
					params: [
						{ name: "handler", type: "RequestHandler", optional: false },
						{ name: "source", type: "APIProvider<P, R>", optional: false },
					],
					returns: [{ type: "MockAPIProvider<P, R>" }],
				},
			},
		]);
	});

	test("emits multiple signatures for multiple constructor overloads", async () => {
		const element = await extractor.extract(
			file(`
/** A range. */
export class Range {
	constructor(max: number);
	constructor(min: number, max: number);
	constructor(min: number, max?: number) {}
}
`),
		);
		const props = (element.props.children as { props: { signatures: string[] } }[])[0]?.props;
		expect(props?.signatures).toEqual([
			"new Range(max: number)",
			"new Range(min: number, max: number)",
			"new Range(min: number, max?: number)",
		]);
	});

	test("emits `new ClassName()` with no params for a class with no explicit constructor", async () => {
		const element = await extractor.extract(
			file(`
/** A choice schema. */
export class ChoiceSchema<T> {
	value: T;
}
`),
		);
		expect(element.props.children).toMatchObject([
			{
				props: {
					kind: "class",
					name: "ChoiceSchema",
					signatures: ["new ChoiceSchema<T>()"],
					returns: [{ type: "ChoiceSchema<T>" }],
				},
			},
		]);
		// A no-arg constructor contributes no params.
		const props = (element.props.children as { props: { params?: unknown } }[])[0]?.props;
		expect(props?.params).toBeUndefined();
	});

	test("sources constructor param descriptions from the constructor's @param", async () => {
		const element = await extractor.extract(
			file(`
/** A user. */
export class User {
	/**
	 * Create a user.
	 * @param name The user's display name.
	 */
	constructor(name: string) {}
}
`),
		);
		const props = (element.props.children as { props: { params: unknown } }[])[0]?.props;
		expect(props?.params).toEqual([{ name: "name", type: "string", description: "The user's display name.", optional: false }]);
	});

	test("falls back to the class's @param for constructor param descriptions, constructor winning on collision", async () => {
		const element = await extractor.extract(
			file(`
/**
 * A point.
 * @param x The horizontal coordinate.
 * @param y The vertical coordinate.
 */
export class Point {
	/**
	 * Create a point.
	 * @param x The X position (constructor-level, wins).
	 */
	constructor(x: number, y: number) {}
}
`),
		);
		const props = (element.props.children as { props: { params: unknown } }[])[0]?.props;
		expect(props?.params).toEqual([
			{ name: "x", type: "number", description: "The X position (constructor-level, wins).", optional: false },
			{ name: "y", type: "number", description: "The vertical coordinate.", optional: false },
		]);
	});

	test("sources the returns description from the class's @returns when present", async () => {
		const element = await extractor.extract(
			file(`
/**
 * A token.
 * @returns A freshly minted token.
 */
export class Token {
	constructor(value: string) {}
}
`),
		);
		const props = (element.props.children as { props: { returns: unknown } }[])[0]?.props;
		expect(props?.returns).toEqual([{ type: "Token", description: "A freshly minted token." }]);
	});

	test("parses @returns with type and description", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Get the first element.
 * @returns {T} The first element of the array.
 */
export function first<T>(arr: T[]): T { return arr[0]!; }
`),
		);
		const children = element.props.children as { props: { returns?: unknown } }[];
		expect(children[0]?.props.returns).toEqual([{ type: "T", description: "The first element of the array." }]);
	});

	test("parses @throws tags as an array", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Divide two numbers.
 * @throws {RangeError} When divisor is zero.
 * @throws {TypeError} When inputs aren't numbers.
 */
export function divide(a: number, b: number): number { return a / b; }
`),
		);
		const children = element.props.children as { props: { throws?: unknown } }[];
		expect(children[0]?.props.throws).toEqual([
			{ type: "RangeError", description: "When divisor is zero." },
			{ type: "TypeError", description: "When inputs aren't numbers." },
		]);
	});

	test("parses @example tags as an array of { description }", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Add numbers.
 * @example add(1, 2)
 * @example add(3, 4)
 */
export function add(a: number, b: number): number { return a + b; }
`),
		);
		const children = element.props.children as { props: { examples?: unknown } }[];
		expect(children[0]?.props.examples).toEqual([{ description: "add(1, 2)" }, { description: "add(3, 4)" }]);
	});

	test("appends unhandled @rule blocks to content", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Add two numbers.
 * @param a First operand.
 * @custom This is a custom tag
 * that spans multiple lines.
 * @deprecated Use \`sum()\` instead.
 */
export function add(a: number, b: number): number { return a + b; }
`),
		);
		const children = element.props.children as { props: { content?: string } }[];
		expect(children[0]?.props.content).toBe(
			"Add two numbers.\n\n@custom This is a custom tag\nthat spans multiple lines.\n\n@deprecated Use `sum()` instead.",
		);
	});

	test("derives description from the first paragraph of a symbol's JSDoc", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Add two numbers together.
 *
 * A second paragraph with more detail that should not appear in the summary.
 */
export function add(a: number, b: number): number {
	return a + b;
}
`),
		);
		const children = element.props.children as { props: { description?: string; content?: string } }[];
		expect(children[0]?.props.description).toBe("Add two numbers together.");
		// The full multi-paragraph text still lands in `content`.
		expect(children[0]?.props.content).toContain("A second paragraph");
	});

	test("derives description for class members from their JSDoc", async () => {
		const element = await extractor.extract(
			file(`
/** A store. */
export class Store {
	/** The current value of the store. */
	value: string;
	/** Replace the stored value. */
	set(v: string): void {}
}
`),
		);
		const cls = (element.props.children as { props: { children: { props: { description?: string } }[] } }[])[0];
		expect(cls?.props.children[0]?.props.description).toBe("The current value of the store.");
		expect(cls?.props.children[1]?.props.description).toBe("Replace the stored value.");
	});

	test("derives the file description from the file-level JSDoc", async () => {
		const element = await extractor.extract(
			file(`
/**
 * This module handles array utilities.
 */
export function first<T>(arr: T[]): T | undefined {
	return arr[0];
}
`),
		);
		expect(element.props.description).toBe("This module handles array utilities.");
	});

	test("leaves description undefined when a symbol has no JSDoc", async () => {
		const element = await extractor.extract(file("export const X = 1;"));
		const children = element.props.children as { props: { description?: string } }[];
		expect(children[0]?.props.description).toBeUndefined();
	});

	test("emits only the type body for a type alias (no alias name)", async () => {
		const element = await extractor.extract(
			file(`
/** A pair of values. */
export type Pair = { a: string; b: number };
`),
		);
		expect(element.props.children).toMatchObject([
			{ type: "tree-documentation", props: { kind: "type", name: "Pair", signatures: ["{ a: string; b: number }"] } },
		]);
	});

	test("emits a brace-wrapped signature for an interface, matching the type body shape", async () => {
		const element = await extractor.extract(
			file(`
/** Options for the thing. */
export interface ThingOptions {
	verbose?: boolean;
	retries: number;
}
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: { kind: "interface", name: "ThingOptions", signatures: ["{ verbose?: boolean; retries: number }"] },
			},
		]);
	});

	test("de-duplicates identical overload signatures, keeping distinct ones", async () => {
		const element = await extractor.extract(
			file(`
/** Add values. */
export function add(a: number, b: number): number;
/** Add values. */
export function add(a: number, b: number): number;
/** Add values. */
export function add(a: string, b: string): string;
export function add(a: any, b: any): any { return a + b; }
`),
		);
		const props = (element.props.children as { props: { signatures: string[] } }[])[0]?.props;
		expect(props?.signatures).toEqual([
			"add(a: number, b: number): number",
			"add(a: string, b: string): string",
			"add(a: any, b: any): any",
		]);
	});

	test("de-duplicates identical params and returns across overloads, keeping distinct ones", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Combine values.
 * @returns {number} The combined value.
 */
export function combine(a: number, b: number): number;
/**
 * Combine values.
 * @returns {number} The combined value.
 */
export function combine(a: number, b: number): number;
export function combine(a: number, b: number): number { return a + b; }
`),
		);
		const props = (element.props.children as { props: { params: unknown; returns: unknown } }[])[0]?.props;
		// All three declarations share the same params — deduped to a single (a, b) pair.
		expect(props?.params).toEqual([
			{ name: "a", type: "number", description: undefined, optional: false },
			{ name: "b", type: "number", description: undefined, optional: false },
		]);
		// The two documented overloads share a return; the implementation's bare `number` return differs by description and is kept.
		expect(props?.returns).toEqual([
			{ type: "number", description: "The combined value." },
			{ type: "number", description: undefined },
		]);
	});

	test("de-duplicates identical throws and examples across overloads, keeping distinct ones", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Do a thing.
 * @throws {RangeError} Bad range.
 * @example doThing(1)
 */
export function doThing(a: number): number;
/**
 * Do a thing.
 * @throws {RangeError} Bad range.
 * @throws {TypeError} Bad type.
 * @example doThing(1)
 * @example doThing(2)
 */
export function doThing(a: any): any { return a; }
`),
		);
		const props = (element.props.children as { props: { throws: unknown; examples: unknown } }[])[0]?.props;
		expect(props?.throws).toEqual([
			{ type: "RangeError", description: "Bad range." },
			{ type: "TypeError", description: "Bad type." },
		]);
		expect(props?.examples).toEqual([{ description: "doThing(1)" }, { description: "doThing(2)" }]);
	});

	test("strips directory path from filename when computing key/name", async () => {
		// In production, `BunFile.name` is the full absolute path (e.g. `/Users/.../modules/util/array.ts`).
		// The extractor should use only the basename.
		const element = await extractor.extract(file("export const X = 1;", "/Users/foo/modules/util/array.ts"));
		expect(element.props.name).toBe("array");
		expect(element.key).toBe("array.ts");
	});
});
