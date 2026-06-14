import { describe, expect, test } from "bun:test";
import type { AbsolutePath } from "../util/path.js";
import type { TreeElement } from "../util/tree.js";
import { Extractor } from "./Extractor.js";
import { IndexExtractor } from "./IndexExtractor.js";

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

class _StubExtractor extends Extractor<void, TreeElement> {
	private readonly _root: TreeElement;
	constructor(root: TreeElement) {
		super();
		this._root = root;
	}
	extract(): TreeElement {
		return this._root;
	}
}

describe("IndexExtractor", () => {
	test("absorbs README.md into the parent directory", async () => {
		const readme = _file("README.md", { title: "Util", description: "Utility helpers.", content: "Body of the README." });
		const root = _dir("util", [readme, _file("string.ts", { content: "ts body" })]);
		const out = await new IndexExtractor(new _StubExtractor(root)).extract(undefined);
		expect(out.props.title).toBe("Util");
		expect(out.props.description).toBe("Utility helpers.");
		expect(out.props.content).toBe("Body of the README.");
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		expect(kids).toHaveLength(1);
		expect(kids[0]?.key).toBe("string.ts");
	});

	test("prefers README.md over an index.ts barrel regardless of child order", async () => {
		// `index.ts` is listed first on disk but carries no prose; the README must still win.
		const root = _dir("ui", [
			_file("index.ts", { content: "" }),
			_file("README.md", { title: "UI", description: "Component library.", content: "The README body." }),
		]);
		const out = await new IndexExtractor(new _StubExtractor(root)).extract(undefined);
		expect(out.props.title).toBe("UI");
		expect(out.props.content).toBe("The README body.");
		// The barrel stays as a child (it just isn't the absorbed index).
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		expect(kids.map(c => c.key)).toEqual(["index.ts"]);
	});

	test("leaves the directory untouched when no index child is found", async () => {
		const root = _dir("util", [_file("string.ts", { content: "ts" })]);
		const out = await new IndexExtractor(new _StubExtractor(root)).extract(undefined);
		expect(out.props.content).toBeUndefined();
		expect(Array.from(out.props.children as Iterable<TreeElement>)).toHaveLength(1);
	});

	test("recurses into subdirectories", async () => {
		const root = _dir("modules", [_dir("util", [_file("README.md", { title: "Util", content: "Nested readme." })])]);
		const out = await new IndexExtractor(new _StubExtractor(root)).extract(undefined);
		const subdir = Array.from(out.props.children as Iterable<TreeElement>)[0] as TreeElement;
		expect(subdir.props.title).toBe("Util");
		expect(subdir.props.content).toBe("Nested readme.");
		expect(Array.from(subdir.props.children as Iterable<TreeElement>)).toHaveLength(0);
	});

	test("respects a custom index pattern", async () => {
		const root = _dir("x", [_file("CUSTOM.md", { title: "Custom", content: "Custom intro." })]);
		const out = await new IndexExtractor(new _StubExtractor(root), { index: [/^custom\.md$/i] }).extract(undefined);
		expect(out.props.title).toBe("Custom");
		expect(out.props.content).toBe("Custom intro.");
		expect(Array.from(out.props.children as Iterable<TreeElement>)).toHaveLength(0);
	});

	test("primary directory metadata wins over absorbed index", async () => {
		const readme = _file("README.md", { title: "Index title", description: "Index desc.", content: "From index." });
		const root = _dir("util", [readme], { title: "Original", description: "Original desc.", content: "Original body." });
		const out = await new IndexExtractor(new _StubExtractor(root)).extract(undefined);
		expect(out.props.title).toBe("Original");
		expect(out.props.description).toBe("Original desc.");
		expect(out.props.content).toBe("Original body.");
	});
});
