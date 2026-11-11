import { describe, expect, test } from "bun:test";
import { formatPlaygroundCSS, formatPlaygroundHash, insertPlaygroundSnippet, insertPlaygroundText, parsePlaygroundHash } from "shelving/ui";

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

describe("insertPlaygroundText()", () => {
	test("adds text at the end on its own line", () => {
		expect(insertPlaygroundText("", "b")).toBe("b\n");
		expect(insertPlaygroundText("a", "b")).toBe("a\nb\n");
		expect(insertPlaygroundText("a\n", "b")).toBe("a\nb\n");
	});
	test("adds text inside the last CSS rule with no cursor", () => {
		expect(insertPlaygroundText(":root {\n  --a: 1;\n}\n", "  --b: 2;")).toBe(":root {\n  --a: 1;\n  --b: 2;\n}\n");
	});
	test("adds text after the line the cursor is on", () => {
		expect(insertPlaygroundText("one\ntwo\nthree", "new", 5)).toBe("one\ntwo\nnew\nthree");
		expect(insertPlaygroundText("one\n\nthree", "new", 4)).toBe("one\nnew\nthree");
	});
});

describe("insertPlaygroundSnippet()", () => {
	test("adds the snippet and its imports to empty code", () => {
		expect(insertPlaygroundSnippet("", 'import { Button } from "shelving/ui";\n\n<Button>Hi</Button>')).toBe(
			'import { Button } from "shelving/ui";\n\n<Button>Hi</Button>\n',
		);
	});
	test("merges names into an import from the same module", () => {
		const code = 'import { Card } from "shelving/ui";\n\n<Card />\n';
		expect(insertPlaygroundSnippet(code, 'import { Button, Card } from "shelving/ui";\n\n<Button>Hi</Button>')).toBe(
			'import { Card, Button } from "shelving/ui";\n\n<Card />\n<Button>Hi</Button>\n',
		);
	});
	test("adds names on their own line to an import that is split over lines", () => {
		const code = 'import {\n  Card,\n} from "shelving/ui";\n\n<Card />\n';
		expect(insertPlaygroundSnippet(code, 'import { Button } from "shelving/ui";\n\n<Button>Hi</Button>')).toBe(
			'import {\n  Card,\n  Button,\n} from "shelving/ui";\n\n<Card />\n<Button>Hi</Button>\n',
		);
	});
	test("adds a new import after the last import", () => {
		const code = 'import { Card } from "shelving/ui";\n\n<Card />\n';
		expect(insertPlaygroundSnippet(code, 'import { DATA } from "shelving/schema";\n\nDATA')).toBe(
			'import { Card } from "shelving/ui";\nimport { DATA } from "shelving/schema";\n\n<Card />\nDATA\n',
		);
	});
});
