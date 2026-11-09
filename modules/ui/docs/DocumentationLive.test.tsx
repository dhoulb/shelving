import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { MarkupParser } from "shelving/markup";
import { DOCUMENTATION_MARKUP_RULES, DocumentationLive } from "shelving/ui";

const PARSER = new MarkupParser({ rules: DOCUMENTATION_MARKUP_RULES });

describe("DOCUMENTATION_LIVE_RULE", () => {
	test("renders a live block as a live example", () => {
		expect(PARSER.parse('```tsx live "My title"\n<Button>Hi</Button>\n```')).toMatchObject({
			type: DocumentationLive,
			props: { code: "<Button>Hi</Button>", title: "My title" },
		});
	});
	test("leaves other blocks as code", () => {
		expect(PARSER.parse("```tsx\n<Button>Hi</Button>\n```")).toMatchObject({ type: "figure" });
		expect(PARSER.parse('```tsx "A live demo"\n<Button>Hi</Button>\n```')).toMatchObject({ type: "figure" });
	});
	test("leaves a live block inside a longer fence as code", () => {
		expect(PARSER.parse("````md\n```tsx live\n<Button>Hi</Button>\n```\n````")).toMatchObject({
			type: "figure",
			props: { children: { type: "pre", props: { children: { props: { children: "```tsx live\n<Button>Hi</Button>\n```" } } } } },
		});
	});
});

describe("<DocumentationLive>", () => {
	test("renders the code, a frame, and a playground link", () => {
		const html = renderToString(<DocumentationLive code="<Button>Hi</Button>" />);
		expect(html).toContain("&lt;Button&gt;Hi&lt;/Button&gt;");
		expect(html).toContain('src="frame.html#code=PEJ1dHRvbj5IaTwvQnV0dG9uPg"');
		expect(html).toContain('href="playground#code=PEJ1dHRvbj5IaTwvQnV0dG9uPg"');
	});
});
