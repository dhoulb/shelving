import { describe, expect, test } from "bun:test";
import { type Elements, getElementText } from "../util/element.js";
import { MarkdownExtractor } from "./index.js";

const extractor = new MarkdownExtractor();

describe("MarkdownExtractor", () => {
	test("extracts title from first h1 heading", () => {
		const element = extractor.extract("# My Title\n\nSome content.");
		expect(element.props.title).toBe("My Title");
	});

	test("returns file element with parsed content", () => {
		const element = extractor.extract("# Hello\n\nWorld.");
		expect(element.type).toBe("tree-file");
		expect(element.props.content).toBeDefined();
		expect(getElementText(element.props.content as Elements)).toContain("Hello");
	});

	test("handles markdown without heading", () => {
		const element = extractor.extract("Just some text.");
		expect(element.props.title).toBeUndefined();
		expect(element.props.content).toBeDefined();
	});
});
