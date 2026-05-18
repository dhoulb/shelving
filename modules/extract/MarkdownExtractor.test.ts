import { describe, expect, test } from "bun:test";
import type { BunFile } from "bun";
import { MarkdownExtractor } from "./index.js";

const extractor = new MarkdownExtractor();

/**
 * Make a fake `BunFile` for unit tests.
 * - Web `File` has the same `.name` and `.text()` behaviour the extractor needs.
 * - The extra `BunFile`-only methods (`writer`, `exists`, etc.) aren't touched by the extractor.
 */
function file(content: string, name = "/tmp/doc.md"): BunFile {
	return new File([content], name) as unknown as BunFile;
}

describe("MarkdownExtractor", () => {
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
});
