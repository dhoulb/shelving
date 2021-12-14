import { nodeToText, nodeToHtml, renderMarkup } from "../index.js";
import { yieldElements } from "./helpers.js";

describe("nodeToText()", () => {
	test("Nodes can be converted to plain text", () => {
		expect(nodeToText(renderMarkup("PARAGRAPH"))).toBe("PARAGRAPH");
		expect(nodeToText(renderMarkup("- ITEM1\n- ITEM2"))).toBe("ITEM1 ITEM2");
		expect(nodeToText(renderMarkup("- ITEM\n  - ITEM1\n  - ITEM2"))).toBe("ITEM ITEM1 ITEM2");
		expect(nodeToText(renderMarkup("1. ITEM1\n2. ITEM2\n3. ITEM3"))).toBe("ITEM1 ITEM2 ITEM3");
	});
});
describe("nodeToHtml()", () => {
	test("Nodes can be converted to plain HTML", () => {
		expect(nodeToHtml(renderMarkup("PARAGRAPH"))).toBe("<p>PARAGRAPH</p>");
		expect(nodeToHtml(renderMarkup("- ITEM1\n- ITEM2"))).toBe("<ul><li>ITEM1</li><li>ITEM2</li></ul>");
		expect(nodeToHtml(renderMarkup("- ITEM\n  - ITEM1\n  - ITEM2"))).toBe("<ul><li>ITEM<ul><li>ITEM1</li><li>ITEM2</li></ul></li></ul>");
		expect(nodeToHtml(renderMarkup("1. ITEM1\n2. ITEM2\n3. ITEM3"))).toBe(
			`<ol><li value="1">ITEM1</li><li value="2">ITEM2</li><li value="3">ITEM3</li></ol>`,
		);
		expect(nodeToHtml(renderMarkup("[GOOG](https://google.com)"))).toBe(`<p><a href="https://google.com/">GOOG</a></p>`);
	});
});
test("yieldElements()", () => {
	expect(Array.from(yieldElements(renderMarkup("PARAGRAPH")))).toHaveLength(1);
	expect(Array.from(yieldElements(renderMarkup("PARAGRAPH")))).toMatchObject([{ type: "p" }]);
	expect(Array.from(yieldElements(renderMarkup("- ITEM1\n- ITEM2")))).toMatchObject([
		{ type: "ul" },
		{ type: "li", props: { children: "ITEM1" } },
		{ type: "li", props: { children: "ITEM2" } },
	]);
});
