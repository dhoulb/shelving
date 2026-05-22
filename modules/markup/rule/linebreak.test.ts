import { expect, test } from "bun:test";
import { MarkupParser } from "../index.js";

const PARSER = new MarkupParser();

test("LINEBREAK", () => {
	expect(PARSER.parse("WORD1\nWORD2", "inline")).toMatchObject(["WORD1", { type: "br" }, "WORD2"]);

	// Linebreaks trim leading and trailing whitespace.
	expect(PARSER.parse("WORD1    \n     WORD2", "inline")).toMatchObject(["WORD1", { type: "br" }, "WORD2"]);
	expect(PARSER.parse("WORD1\t\t\n\t\tWORD2", "inline")).toMatchObject(["WORD1", { type: "br" }, "WORD2"]);

	// Linebreaks match in "list" context.
	expect(PARSER.parse("WORD1\nWORD2", "list")).toMatchObject(["WORD1", { type: "br" }, "WORD2"]);
});
