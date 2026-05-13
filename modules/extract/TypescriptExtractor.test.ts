import { describe, expect, test } from "bun:test";
import type { BunFile } from "bun";
import { TypescriptExtractor } from "./index.js";

const extractor = new TypescriptExtractor();

/**
 * Make a fake `BunFile` for unit tests.
 * - Web `File` has the same `.name` and `.text()` behaviour the extractor needs.
 * - The extra `BunFile`-only methods (`writer`, `exists`, etc.) aren't touched by the extractor.
 */
function file(source: string, name = "source.ts"): BunFile {
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
				props: { kind: "function", name: "add", description: "Add two numbers together.", signature: "(a: number, b: number) => number" },
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
			{ type: "tree-documentation", props: { kind: "constant", name: "MAX_RETRIES", signature: "number" } },
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
		const cls = children[0] as { type: string; props: { kind: string; name: string; children: unknown[] } };
		expect(cls.type).toBe("tree-documentation");
		expect(cls.props.kind).toBe("class");
		expect(cls.props.name).toBe("Store");
		expect(cls.props.children).toMatchObject([
			{ type: "tree-documentation", props: { kind: "property", name: "value", signature: "string" } },
			{ type: "tree-documentation", props: { kind: "method", name: "set" } },
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
		expect(element.props.children).toMatchObject([{ type: "tree-documentation", props: { kind: "interface", name: "ThingOptions" } }]);
	});

	test("extracts exported type alias", async () => {
		const element = await extractor.extract(
			file(`
/** A nullable string. */
export type NullableString = string | null;
`),
		);
		expect(element.props.children).toMatchObject([
			{ type: "tree-documentation", props: { kind: "type", name: "NullableString", signature: "string | null" } },
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

	test("leaves title undefined (no confident source for a TS source file)", async () => {
		const element = await extractor.extract(file("export const X = 1;", "array.ts"));
		expect(element.props.title).toBeUndefined();
		expect(element.props.name).toBe("array.ts");
		expect(element.key).toBe("array");
	});

	test("strips directory path from filename when computing key/name", async () => {
		// In production, `BunFile.name` is the full absolute path (e.g. `/Users/.../modules/util/array.ts`).
		// The extractor should use only the basename.
		const element = await extractor.extract(file("export const X = 1;", "/Users/foo/modules/util/array.ts"));
		expect(element.props.name).toBe("array.ts");
		expect(element.key).toBe("array");
	});
});
