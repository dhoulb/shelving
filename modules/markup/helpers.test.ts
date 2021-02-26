import { cleanMarkup, nodeToText, nodeToHtml, renderMarkup } from "..";

describe("nodeToText()", () => {
	test("Nodes can be converted to plain text", () => {
		expect(nodeToText(renderMarkup("PARAGRAPH"))).toBe("PARAGRAPH");
		expect(nodeToText(renderMarkup("- ITEM1\n- ITEM2"))).toBe("ITEM1 ITEM2");
		expect(nodeToText(renderMarkup("- ITEM\n  - ITEM1\n  - ITEM2"))).toBe("ITEM ITEM1 ITEM2");
		expect(nodeToText(renderMarkup("1. ITEM1\n2. ITEM2\n3. ITEM3"))).toBe("ITEM1 ITEM2 ITEM3");
	});
});
describe("nodeToHtml()", () => {
	test("Nodes can be converted to plain text", () => {
		expect(nodeToHtml(renderMarkup("PARAGRAPH"))).toBe("<p>PARAGRAPH</p>");
		expect(nodeToHtml(renderMarkup("- ITEM1\n- ITEM2"))).toBe("<ul><li>ITEM1</li><li>ITEM2</li></ul>");
		expect(nodeToHtml(renderMarkup("- ITEM\n  - ITEM1\n  - ITEM2"))).toBe("<ul><li>ITEM<ul><li>ITEM1</li><li>ITEM2</li></ul></li></ul>");
		expect(nodeToHtml(renderMarkup("1. ITEM1\n2. ITEM2\n3. ITEM3"))).toBe(
			`<ol><li value="1">ITEM1</li><li value="2">ITEM2</li><li value="3">ITEM3</li></ol>`,
		);
		expect(nodeToHtml(renderMarkup("[GOOG](https://google.com)"))).toBe(`<p><a href="https://google.com/">GOOG</a></p>`);
	});
});
test("cleanMarkup()", () => {
	// Trailing spaces are cleared correctly.
	expect(cleanMarkup("aaa    ")).toEqual("aaa");
	// Trailing spaces are cleared but trailing newlines are not.
	expect(cleanMarkup("aaa    \n     ")).toEqual("aaa\n");
	expect(cleanMarkup("aaa    \n\f\f\f\f")).toEqual("aaa\n");
	// Carriage returns are converted to plain newlines.
	expect(cleanMarkup("aaa\r\naaa")).toEqual("aaa\naaa");
	expect(cleanMarkup("aaa\raaa")).toEqual("aaa\naaa");
	expect(cleanMarkup("aaa\r\raaa")).toEqual("aaa\n\naaa");
	expect(cleanMarkup("aaa\r")).toEqual("aaa\n");
	// Tabs and other weird whitespaces are converted to spaces.
	expect(cleanMarkup("aaa\taaa\faaa")).toEqual("aaa aaa aaa");
});
