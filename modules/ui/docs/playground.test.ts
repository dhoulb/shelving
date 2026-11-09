import { describe, expect, test } from "bun:test";
import { formatPlaygroundCSS, formatPlaygroundHash, parsePlaygroundHash } from "shelving/ui";

describe("formatPlaygroundHash()", () => {
	test("empty input gives an empty hash", () => {
		expect(formatPlaygroundHash({})).toBe("");
		expect(formatPlaygroundHash({ code: "", css: "" })).toBe("");
	});
	test("encodes code and CSS", () => {
		expect(formatPlaygroundHash({ code: "<Button>Hi</Button>" })).toBe("#code=PEJ1dHRvbj5IaTwvQnV0dG9uPg");
		expect(formatPlaygroundHash({ code: "a", css: "b" })).toBe("#code=YQ&css=Yg");
	});
});

describe("parsePlaygroundHash()", () => {
	test("decodes code and CSS", () => {
		expect(parsePlaygroundHash("#code=PEJ1dHRvbj5IaTwvQnV0dG9uPg")).toEqual({ code: "<Button>Hi</Button>", css: undefined });
		expect(parsePlaygroundHash("code=YQ&css=Yg")).toEqual({ code: "a", css: "b" });
	});
	test("round trip keeps unicode", () => {
		const input = { code: "<Paragraph>Héllo → 👋</Paragraph>", css: ":root { --x: 1; }" };
		expect(parsePlaygroundHash(formatPlaygroundHash(input))).toEqual(input);
	});
	test("leaves out missing or invalid values", () => {
		expect(parsePlaygroundHash("")).toEqual({ code: undefined, css: undefined });
		expect(parsePlaygroundHash("#code=!!!")).toEqual({ code: undefined, css: undefined });
	});
});

describe("formatPlaygroundCSS()", () => {
	test("no variables gives an empty string", () => {
		expect(formatPlaygroundCSS([])).toBe("");
	});
	test("formats a root rule with comments", () => {
		expect(
			formatPlaygroundCSS([
				{ name: "--card-radius", value: "var(--radius-normal)", description: "Corner radius" },
				{ name: "--card-space", value: "0" },
			]),
		).toBe(":root {\n  --card-radius: var(--radius-normal); /* Corner radius */\n  --card-space: 0;\n}\n");
	});
});
