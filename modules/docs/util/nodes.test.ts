import { describe, expect, test } from "bun:test";
import type { PathNode, PathNodes, SymbolNode } from "./nodes.js";
import { mergeSymbolNodes, nestPathNodes } from "./nodes.js";

describe("mergeSymbolNodes()", () => {
	test("merges nodes with the same name, combining signatures, params, and returns", () => {
		const first: SymbolNode = {
			kind: "function",
			name: "foo",
			signatures: ["foo(a: string): number"],
			params: [{ name: "a", type: "string", description: "first" }],
			returns: [{ type: "number", description: "first return" }],
			examples: ["ex1"],
		};
		const second: SymbolNode = {
			kind: "function",
			name: "foo",
			signatures: ["foo(a: number): number"],
			params: [{ name: "a", type: "string", description: "override" }],
			returns: [{ type: "number", description: "override return" }],
			examples: ["ex2"],
		};

		const [merged] = mergeSymbolNodes([first, second]);
		expect(merged!.signatures).toEqual(["foo(a: string): number", "foo(a: number): number"]);
		expect(merged!.params).toEqual([{ name: "a", type: "string", description: "override" }]);
		expect(merged!.returns).toEqual([{ type: "number", description: "override return" }]);
		expect(merged!.examples).toEqual(["ex1", "ex2"]);
	});

	test("does not merge nodes with different names", () => {
		const foo: SymbolNode = { kind: "function", name: "foo", signatures: ["foo(): void"] };
		const bar: SymbolNode = { kind: "function", name: "bar", signatures: ["bar(): void"] };

		const merged = mergeSymbolNodes([foo, bar]);
		expect(merged).toHaveLength(2);
		expect(merged[0]!.name).toBe("foo");
		expect(merged[1]!.name).toBe("bar");
	});

	test("keeps distinct return types when merging", () => {
		const first: SymbolNode = {
			kind: "method",
			name: "baz",
			signatures: ["baz(): string"],
			returns: [{ type: "string", description: "text" }],
		};
		const second: SymbolNode = {
			kind: "method",
			name: "baz",
			signatures: ["baz(): number"],
			returns: [{ type: "number", description: "count" }],
		};

		const [merged] = mergeSymbolNodes([first, second]);
		expect(merged!.returns).toEqual([
			{ type: "string", description: "text" },
			{ type: "number", description: "count" },
		]);
	});
});

describe("groupPathNodes()", () => {
	test("basic test", () => {
		const input: PathNodes = [{ kind: "file", name: "b.txt", path: "a/b.txt", description: "BBB", children: [] }];
		const output = nestPathNodes(input);
		expect(output).toMatchObject({
			kind: "directory",
			path: "",
			name: "",
			children: [
				{
					kind: "directory",
					name: "a",
					path: "a",
					children: [
						{
							name: "b.txt",
							path: "a/b.txt",
							description: "BBB",
							children: [],
						},
					],
				},
			],
		});
	});
	test("nests files into directories and strips extensions from paths", () => {
		const input: PathNode[] = [
			{ kind: "file", name: "README.md", path: "pkg/README.md", description: "pkg docs", children: [] },
			{ kind: "file", name: "util.ts", path: "pkg/util.ts", children: [] },
			{ kind: "file", name: "deep.ts", path: "pkg/nested/deep.ts", children: [] },
		];

		const root = nestPathNodes(input);
		expect(root).toMatchObject({
			kind: "directory",
			name: "",
			path: "",
			children: [
				{
					kind: "directory",
					name: "pkg",
					path: "pkg",
					description: "pkg docs",
					children: [
						{
							kind: "file",
							name: "util.ts",
							path: "pkg/util.ts",
						},
						{
							kind: "directory",
							name: "nested",
							path: "pkg/nested",
							children: [
								{
									kind: "file",
									name: "deep.ts",
									path: "pkg/nested/deep.ts",
								},
							],
						},
					],
				},
			],
		});
	});

	test("keeps separate top-level directories", () => {
		const input: PathNode[] = [
			{ kind: "file", name: "a.ts", path: "alpha/a.ts", children: [] },
			{ kind: "file", name: "b.ts", path: "beta/b.ts", children: [] },
		];

		const root = nestPathNodes(input);
		expect(root.children).toMatchObject([
			{ kind: "directory", name: "alpha", path: "alpha" },
			{ kind: "directory", name: "beta", path: "beta" },
		]);
	});
});
