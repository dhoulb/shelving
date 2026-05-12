import { describe, expect, test } from "bun:test";
import { type Elements, getElementText } from "../util/element.js";
import { MarkdownExtractor } from "./index.js";

const extractor = new MarkdownExtractor();

function file(content: string, name = "doc.md"): File {
	return new File([content], name);
}

describe("MarkdownExtractor", () => {
	test("extracts title from first h1 heading", async () => {
		const element = await extractor.extract(file("# My Title\n\nSome content."));
		expect(element.props.title).toBe("My Title");
	});

	test("returns file element with parsed content", async () => {
		const element = await extractor.extract(file("# Hello\n\nWorld."));
		expect(element.type).toBe("tree-file");
		expect(element.props.content).toBeDefined();
		expect(getElementText(element.props.content as Elements)).toContain("Hello");
	});

	test("falls back to filename (without extension) if no heading", async () => {
		const element = await extractor.extract(file("Just some text.", "TEMPLATE.md"));
		expect(element.props.title).toBe("TEMPLATE");
		expect(element.props.content).toBeDefined();
	});

	test("sets key to slugified filename", async () => {
		const element = await extractor.extract(file("# Hi", "Some Doc.md"));
		expect(element.key).toBe("some-doc");
	});
});
