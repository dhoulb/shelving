import { describe, expect, test } from "bun:test";
import { ModuleExtractor } from "shelving/extract";
import type { AbsolutePath } from "shelving/util/path";
import type { DocumentationElement, TreeElement } from "shelving/util/tree";

function _file(key: string, props: Partial<TreeElement["props"]> = {}): TreeElement {
	const [name] = key.split(".");
	return {
		type: "tree-element",
		key,
		props: { name: name ?? key, source: `/tmp/${key}` as AbsolutePath, ...props },
	};
}

function _dir(key: string, children: TreeElement[], props: Partial<TreeElement["props"]> = {}): TreeElement {
	return {
		type: "tree-element",
		key,
		props: { name: key, source: `/tmp/${key}` as AbsolutePath, children, ...props },
	};
}

function _doc(key: string, kind: string, props: Partial<DocumentationElement["props"]> = {}): DocumentationElement {
	return { type: "tree-documentation", key, props: { name: key, kind, ...props } };
}

const extractor = new ModuleExtractor();

describe("ModuleExtractor", () => {
	test("builds a kind=module element from a single file source", () => {
		const source = _file("string.ts", {
			content: "Module body.",
			description: "String helpers.",
			children: [_doc("getString", "function"), _doc("StringSchema", "class")],
		});
		const out = extractor.extract({ name: "util/string", source });
		expect(out.type).toBe("tree-documentation");
		expect(out.props.kind).toBe("module");
		expect(out.props.name).toBe("util/string");
		expect(out.props.title).toBe("util/string");
		expect(out.props.content).toBe("Module body.");
		expect(out.props.description).toBe("String helpers.");
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		expect(kids).toHaveLength(2);
		expect(kids[0]?.key).toBe("getString");
		expect(kids[1]?.key).toBe("StringSchema");
	});

	test("flattens documentation across files inside a directory source", () => {
		const source = _dir(
			"util",
			[
				_file("string.ts", { children: [_doc("getString", "function")] }),
				_file("array.ts", { children: [_doc("getArray", "function"), _doc("addArray", "function")] }),
			],
			{ content: "Util README." },
		);
		const out = extractor.extract({ name: "util", source });
		expect(out.props.content).toBe("Util README.");
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		expect(kids.map(k => k.key)).toEqual(["getString", "getArray", "addArray"]);
	});

	test("does not descend into a documentation symbol's own members", () => {
		// `StringSchema` has a child method `set` — that method should not appear as a sibling of `StringSchema`.
		const source = _file("string.ts", {
			children: [_doc("StringSchema", "class", { children: [_doc("set", "method")] }), _doc("getString", "function")],
		});
		const out = extractor.extract({ name: "util/string", source });
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		expect(kids.map(k => k.key)).toEqual(["StringSchema", "getString"]);
	});

	test("descends through nested directories", () => {
		const source = _dir("api", [_dir("provider", [_file("FooProvider.ts", { children: [_doc("FooProvider", "class")] })])]);
		const out = extractor.extract({ name: "api", source });
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		expect(kids).toHaveLength(1);
		expect(kids[0]?.key).toBe("FooProvider");
	});

	test("omits the children prop when nothing is found", () => {
		const source = _file("empty.ts", { content: "No exports." });
		const out = extractor.extract({ name: "empty", source });
		expect(out.props.children).toBeUndefined();
	});
});
