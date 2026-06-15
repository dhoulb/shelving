import { describe, expect, test } from "bun:test";
import type { AbsolutePath } from "../util/path.js";
import type { TreeElement } from "../util/tree.js";
import { Extractor } from "./Extractor.js";
import { MergingExtractor } from "./MergingExtractor.js";

/** Helper to build a file `tree-element` for tests. */
function _file(key: string, props: Partial<TreeElement["props"]> = {}): TreeElement {
	const [name] = key.split(".");
	return {
		type: "tree-element",
		key,
		props: { name: name ?? key, source: `/tmp/${key}` as AbsolutePath, ...props },
	};
}

/** Helper to build a directory `tree-element` for tests. */
function _dir(key: string, children: TreeElement[], props: Partial<TreeElement["props"]> = {}): TreeElement {
	return {
		type: "tree-element",
		key,
		props: { name: key, source: `/tmp/${key}` as AbsolutePath, children, ...props },
	};
}

/** Minimal source extractor that just returns whatever it's constructed with — lets us test through-extractor behaviour in isolation. */
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

describe("MergingExtractor", () => {
	test("merges sibling .md into .ts and keeps the .ts key", async () => {
		const root = _dir("util", [
			_file("string.ts", { children: [{ type: "tree-documentation", key: "getstring", props: { name: "getString" } }] }),
			_file("string.md", { title: "String utilities", content: "Notes about strings." }),
		]);
		const out = await new MergingExtractor(new _StubExtractor(root)).extract(undefined);
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		expect(kids).toHaveLength(1);
		const merged = kids[0] as TreeElement;
		expect(merged.key).toBe("string.ts");
		expect(merged.props.title).toBe("String utilities");
		expect(merged.props.content).toBe("Notes about strings.");
		// Children from the .ts side are preserved.
		expect(Array.from(merged.props.children as Iterable<TreeElement>)).toHaveLength(1);
	});

	test("folds a .md into the same-named documentation token inside a sibling file", async () => {
		const root = _dir("block", [
			_file("Card.tsx", {
				children: [
					{ type: "tree-documentation", key: "Card", props: { name: "Card", content: "Docblock summary." } },
					{ type: "tree-documentation", key: "CardProps", props: { name: "CardProps" } },
				],
			}),
			_file("Card.md", { title: "Card", content: "Usage and styling." }),
		]);
		const out = await new MergingExtractor(new _StubExtractor(root)).extract(undefined);
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		// The .md is consumed, the file element stays.
		expect(kids).toHaveLength(1);
		expect(kids[0]?.key).toBe("Card.tsx");
		const tokens = Array.from(kids[0]?.props.children as Iterable<TreeElement>);
		const card = tokens.find(t => t.key === "Card");
		// Prose folded onto the token (docblock first, .md appended), not the file element.
		expect(card?.props.content).toBe("Docblock summary.\n\nUsage and styling.");
		// The file element itself stays prose-free; the sibling token CardProps is untouched.
		expect(kids[0]?.props.content).toBeUndefined();
		expect(tokens.find(t => t.key === "CardProps")?.props.content).toBeUndefined();
	});

	test("falls back to file-level merge when no same-named token exists", async () => {
		// `template.md` documents a whole file/family — no `template` symbol — so it folds into the file element.
		const root = _dir("util", [
			_file("template.ts", {
				content: "ts",
				children: [{ type: "tree-documentation", key: "matchTemplate", props: { name: "matchTemplate" } }],
			}),
			_file("template.md", { content: "md" }),
		]);
		const out = await new MergingExtractor(new _StubExtractor(root)).extract(undefined);
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		expect(kids).toHaveLength(1);
		expect(kids[0]?.key).toBe("template.ts");
		expect(kids[0]?.props.content).toBe("ts\n\nmd");
	});

	test("leaves a standalone .md in place when no primary candidate exists", async () => {
		const root = _dir("util", [_file("concepts.md", { title: "Concepts", content: "Standalone prose." })]);
		const out = await new MergingExtractor(new _StubExtractor(root)).extract(undefined);
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		expect(kids).toHaveLength(1);
		expect(kids[0]?.key).toBe("concepts.md");
		expect(kids[0]?.props.title).toBe("Concepts");
	});

	test("merges into the first candidate that exists, in declaration order", async () => {
		const root = _dir("util", [_file("a.md", { title: "A docs" }), _file("a.tsx", { content: "tsx body" })]);
		const out = await new MergingExtractor(new _StubExtractor(root), {
			merges: { "{base}.md": ["{base}.ts", "{base}.tsx"] },
		}).extract(undefined);
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		expect(kids).toHaveLength(1);
		expect(kids[0]?.key).toBe("a.tsx"); // Skipped .ts (doesn't exist), matched .tsx.
		expect(kids[0]?.props.title).toBe("A docs");
	});

	test("descends into subdirectories", async () => {
		const root = _dir("modules", [_dir("util", [_file("string.ts", { content: "ts" }), _file("string.md", { content: "md" })])]);
		const out = await new MergingExtractor(new _StubExtractor(root)).extract(undefined);
		const subdir = Array.from(out.props.children as Iterable<TreeElement>)[0] as TreeElement;
		const kids = Array.from(subdir.props.children as Iterable<TreeElement>);
		expect(kids).toHaveLength(1);
		expect(kids[0]?.key).toBe("string.ts");
		expect(kids[0]?.props.content).toBe("ts\n\nmd");
	});

	test("respects a custom merges map", async () => {
		const root = _dir("x", [_file("readme.txt", { content: "txt" }), _file("readme.md", { content: "md" })]);
		const out = await new MergingExtractor(new _StubExtractor(root), {
			merges: { "{base}.txt": ["{base}.md"] },
		}).extract(undefined);
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		expect(kids).toHaveLength(1);
		expect(kids[0]?.key).toBe("readme.md");
		expect(kids[0]?.props.content).toBe("md\n\ntxt");
	});
});
