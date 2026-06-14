import { expect, test } from "bun:test";
import { MarkupParser } from "../index.js";

const PARSER = new MarkupParser();

test("a block of pipe lines with no delimiter row is not a table", () => {
	expect(PARSER.parse("| a | b |\n| c | d |")).toMatchObject({ type: "p" });
});
