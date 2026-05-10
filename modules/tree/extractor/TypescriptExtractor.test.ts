import { describe, expect, test } from "bun:test";
import { TypescriptExtractor } from "../index.js";

const extractor = new TypescriptExtractor();

describe("TypescriptExtractor", () => {
	test("extracts exported function", () => {
		const element = extractor.extract(`
/** Add two numbers together. */
export function add(a: number, b: number): number {
	return a + b;
}
`);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-function",
				props: { title: "add", description: "Add two numbers together.", signature: "(a: number, b: number) => number" },
			},
		]);
	});

	test("extracts exported constant", () => {
		const element = extractor.extract(`
/** Maximum retry count. */
export const MAX_RETRIES: number = 3;
`);
		expect(element.props.children).toMatchObject([{ type: "tree-constant", props: { title: "MAX_RETRIES", signature: "number" } }]);
	});

	test("extracts exported class with members", () => {
		const element = extractor.extract(`
/** A simple store. */
export class Store {
	/** Current value. */
	value: string;
	/** Update the value. */
	set(v: string): void {}
	private _internal(): void {}
}
`);
		const children = element.props.children as unknown[];
		expect(children).toHaveLength(1);
		const cls = children[0] as { type: string; props: { title: string; children: unknown[] } };
		expect(cls.type).toBe("tree-class");
		expect(cls.props.title).toBe("Store");
		expect(cls.props.children).toMatchObject([
			{ type: "tree-property", props: { title: "value", signature: "string" } },
			{ type: "tree-method", props: { title: "set" } },
		]);
	});

	test("extracts exported interface", () => {
		const element = extractor.extract(`
/** Options for the thing. */
export interface ThingOptions {
	/** Whether to be verbose. */
	verbose?: boolean;
}
`);
		expect(element.props.children).toMatchObject([{ type: "tree-interface", props: { title: "ThingOptions" } }]);
	});

	test("extracts exported type alias", () => {
		const element = extractor.extract(`
/** A nullable string. */
export type NullableString = string | null;
`);
		expect(element.props.children).toMatchObject([{ type: "tree-type", props: { title: "NullableString", signature: "string | null" } }]);
	});

	test("skips non-exported declarations", () => {
		const element = extractor.extract(`
function internal(): void {}
export function external(): void {}
`);
		const children = element.props.children as unknown[];
		expect(children).toHaveLength(1);
	});

	test("skips _-prefixed declarations", () => {
		const element = extractor.extract(`
export function _helper(): void {}
export function publicFn(): void {}
`);
		const children = element.props.children as unknown[];
		expect(children).toHaveLength(1);
	});

	test("skips private and protected class members", () => {
		const element = extractor.extract(`
export class Foo {
	public bar: string;
	private _baz: string;
	protected _qux: string;
}
`);
		const cls = (element.props.children as unknown[])[0] as { props: { children: unknown[] } };
		expect(cls.props.children).toHaveLength(1);
	});

	test("extracts file-level JSDoc comment as description", () => {
		const element = extractor.extract(`
/**
 * This module handles array utilities.
 */
export function first<T>(arr: T[]): T | undefined {
	return arr[0];
}
`);
		expect(element.props.description).toBe("This module handles array utilities.");
	});
});
