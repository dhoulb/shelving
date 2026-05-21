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
					signatures: ["(a: number, b: number) => number"],
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
			{ type: "tree-documentation", props: { kind: "constant", name: "MAX_RETRIES", title: "MAX_RETRIES", signatures: ["number"] } },
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
			{ type: "tree-documentation", props: { kind: "property", name: "value", title: "value", signatures: ["string"] } },
			{ type: "tree-documentation", props: { kind: "method", name: "set", title: "set()" } },
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
		expect(element.key).toBe("array");
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
				signatures: ["(a: number, b: number) => number", "(a: string, b: string) => string", "(a: any, b: any) => any"],
			},
		});
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

	test("strips directory path from filename when computing key/name", async () => {
		// In production, `BunFile.name` is the full absolute path (e.g. `/Users/.../modules/util/array.ts`).
		// The extractor should use only the basename.
		const element = await extractor.extract(file("export const X = 1;", "/Users/foo/modules/util/array.ts"));
		expect(element.props.name).toBe("array");
		expect(element.key).toBe("array");
	});
});
