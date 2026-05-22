import { describe, expect, test } from "bun:test";
import type { BunFile } from "bun";
import { extractMarkdownProps, MarkupExtractor } from "./index.js";

const extractor = new MarkupExtractor();

/**
 * Make a fake `BunFile` for unit tests.
 * - Web `File` has the same `.name` and `.text()` behaviour the extractor needs.
 * - The extra `BunFile`-only methods (`writer`, `exists`, etc.) aren't touched by the extractor.
 */
function file(content: string, name = "/tmp/doc.md"): BunFile {
	return new File([content], name) as unknown as BunFile;
}

describe("MarkupExtractor", () => {
	test("extracts title from first h1 heading", async () => {
		const element = await extractor.extract(file("# My Title\n\nSome content."));
		expect(element.props.title).toBe("My Title");
	});

	test("stores raw markdown as content", async () => {
		const text = "# Hello\n\nWorld.";
		const element = await extractor.extract(file(text));
		expect(element.type).toBe("tree-file");
		expect(element.props.content).toBe(text);
	});

	test("leaves title undefined when no h1 heading is found", async () => {
		const element = await extractor.extract(file("Just some text.", "/tmp/TEMPLATE.md"));
		expect(element.props.title).toBeUndefined();
		expect(element.props.content).toBe("Just some text.");
	});

	test("sets name to basename (preserving case) and key to its slug", async () => {
		const element = await extractor.extract(file("# Hi", "/tmp/SomeDoc.md"));
		expect(element.props.name).toBe("SomeDoc");
		expect(element.key).toBe("somedoc");
	});

	test("strips directory path from filename when computing key", async () => {
		// `BunFile.name` is the full absolute path; the extractor uses only the basename.
		const element = await extractor.extract(file("# Hi", "/tmp/some-dir/foo.md"));
		expect(element.key).toBe("foo");
	});

	test("sets description to the first prose paragraph after the heading", async () => {
		const element = await extractor.extract(file("# Title\n\nThe first paragraph.\n\nThe second paragraph."));
		expect(element.props.description).toBe("The first paragraph.");
	});

	test("leaves description undefined when there is no prose paragraph", async () => {
		const element = await extractor.extract(file("# Just A Heading"));
		expect(element.props.description).toBeUndefined();
	});
});

describe("extractMarkdownProps", () => {
	test("returns the first h1 as title and first paragraph as description", () => {
		expect(extractMarkdownProps("# Title\n\nFirst paragraph.\n\nSecond paragraph.")).toEqual({
			title: "Title",
			description: "First paragraph.",
		});
	});

	test("collapses internal whitespace onto a single line", () => {
		expect(extractMarkdownProps("# Title\n\nA paragraph that\nwraps across\nseveral lines.").description).toBe(
			"A paragraph that wraps across several lines.",
		);
	});

	test("skips headings and blank lines while searching for the description", () => {
		expect(extractMarkdownProps("# Title\n\n## Subheading\n\nThe prose.").description).toBe("The prose.");
	});

	test("skips fenced code blocks", () => {
		expect(extractMarkdownProps("# Title\n\n```ts\nconst x = 1;\n```\n\nThe prose.").description).toBe("The prose.");
	});

	test("strips inline markdown syntax from the description", () => {
		expect(extractMarkdownProps("# Title\n\nUse `getFirst()` and *emphasis* and [a link](http://x.com).").description).toBe(
			"Use getFirst() and emphasis and a link.",
		);
	});

	test("strips inline markdown syntax from the title", () => {
		expect(extractMarkdownProps("# Use `getFirst()` for *this*").title).toBe("Use getFirst() for this");
	});

	test("returns undefined for both when there is no h1 or prose", () => {
		expect(extractMarkdownProps("## Another heading")).toEqual({ title: undefined, description: undefined });
		expect(extractMarkdownProps("")).toEqual({ title: undefined, description: undefined });
	});

	test("derives title and description independently", () => {
		expect(extractMarkdownProps("Just a paragraph.")).toEqual({ title: undefined, description: "Just a paragraph." });
	});
});
