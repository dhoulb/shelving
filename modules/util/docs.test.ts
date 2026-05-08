import { describe, expect, test } from "bun:test";
import { _parseDocblock, type DocsFile, parseDocs } from "./docs.js";

describe("parseDocs()", () => {
	test("nests files into directories by path", () => {
		const files: DocsFile[] = [
			{ path: "ui/inline/Tag.tsx", content: "export function Tag() {}\n" },
			{ path: "ui/block/Card.tsx", content: "export function Card() {}\n" },
			{ path: "util/array.ts", content: "export const arr = [];\n" },
		];
		const { root } = parseDocs(files);
		expect(root.kind).toBe("directory");
		expect(root.children?.map(c => c.name).sort()).toEqual(["ui", "util"]);
		const ui = root.children?.find(c => c.name === "ui");
		expect(ui?.children?.map(c => c.name).sort()).toEqual(["block", "inline"]);
	});

	test("README content becomes the directory description", () => {
		const files: DocsFile[] = [
			{ path: "ui/README.md", content: "# UI module\n\nThe component library." },
			{ path: "ui/Card.tsx", content: "export function Card() {}\n" },
		];
		const { root } = parseDocs(files);
		const ui = root.children?.find(c => c.name === "ui");
		expect(ui?.description).toBe("# UI module\n\nThe component library.");
		expect(ui?.children?.map(c => c.name)).toEqual(["Card.tsx"]);
	});

	test("extracts function symbols with docblock", () => {
		const content = `
/** Adds two numbers.
 * @param {number} a first number
 * @param {number} b second number
 * @returns {number} sum
 * @example add(1, 2)
 */
export function add(a: number, b: number): number {
	return a + b;
}
`;
		const { root } = parseDocs([{ path: "math.ts", content }]);
		const math = root.children?.[0];
		expect(math?.symbols?.length).toBe(1);
		const add = math?.symbols?.[0];
		expect(add?.kind).toBe("function");
		expect(add?.name).toBe("add()");
		expect(add?.description).toBe("Adds two numbers.");
		expect(add?.params).toEqual([
			{ name: "a", type: "number", description: "first number" },
			{ name: "b", type: "number", description: "second number" },
		]);
		expect(add?.examples).toEqual(["add(1, 2)"]);
	});

	test("extracts class with public members and skips private/protected/_-prefixed", () => {
		const content = `
export class Counter {
	value = 0;
	private secret = 1;
	protected hidden = 2;
	_internal = 3;
	increment() { this.value++; }
}
`;
		const { root } = parseDocs([{ path: "Counter.ts", content }]);
		const cls = root.children?.[0]?.symbols?.[0];
		expect(cls?.kind).toBe("class");
		expect(cls?.name).toBe("Counter");
		expect(cls?.children?.map(c => c.name).sort()).toEqual(["increment()", "value"]);
	});

	test("interface, type, and constant", () => {
		const content = `
export interface Foo { a: string; }
export type Bar = number | string;
export const BAZ = 42;
`;
		const { root } = parseDocs([{ path: "x.ts", content }]);
		const symbols = root.children?.[0]?.symbols;
		expect(symbols?.map(s => [s.kind, s.name])).toEqual([
			["interface", "Foo"],
			["type", "Bar"],
			["constant", "BAZ"],
		]);
	});

	test("non-source files store contents as description", () => {
		const { root } = parseDocs([{ path: "guide.txt", content: "hello world" }]);
		expect(root.children?.[0]?.description).toBe("hello world");
		expect(root.children?.[0]?.symbols).toBeUndefined();
	});

	test("forwards extras and title", () => {
		const tokens = parseDocs([], {
			title: "shelving",
			extras: [{ path: "storybook", title: "UI library", slot: "storybook" }],
		});
		expect(tokens.title).toBe("shelving");
		expect(tokens.extras).toEqual([{ path: "storybook", title: "UI library", slot: "storybook" }]);
	});
});

describe("_parseDocblock()", () => {
	test("plain description", () => {
		expect(_parseDocblock("/** Just a description */").description).toBe("Just a description");
	});

	test("multi-line", () => {
		const out = _parseDocblock("/**\n * Line one.\n * Line two.\n */");
		expect(out.description).toBe("Line one.\nLine two.");
	});
});
