import { expect, test } from "bun:test";
import { MarkupParser } from "shelving/markup";

const PARSER = new MarkupParser();

test("BREAK", () => {
	expect(PARSER.parse("***")).toMatchObject({ type: "hr", props: {} });
	expect(PARSER.parse("---")).toMatchObject({ type: "hr", props: {} });
	expect(PARSER.parse("+++")).toMatchObject({ type: "hr", props: {} });
	expect(PARSER.parse("•••")).toMatchObject({ type: "hr", props: {} });
	expect(PARSER.parse("* * *")).toMatchObject({ type: "hr", props: {} });
	expect(PARSER.parse("- - -")).toMatchObject({ type: "hr", props: {} });
	expect(PARSER.parse("+ + +")).toMatchObject({ type: "hr", props: {} });
	expect(PARSER.parse("• • •")).toMatchObject({ type: "hr", props: {} });
});
