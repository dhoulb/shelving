import { cleanMarkup, markupToString, renderMarkup } from "..";

describe("plainNode()", () => {
	test("Nodes can be converted to plain text", () => {
		expect(markupToString(renderMarkup("PARAGRAPH"))).toBe("PARAGRAPH");
		expect(markupToString(renderMarkup("- ITEM1\n- ITEM2"))).toBe("ITEM1 ITEM2");
		expect(markupToString(renderMarkup("- ITEM\n  - ITEM1\n  - ITEM2"))).toBe("ITEM ITEM1 ITEM2");
		expect(markupToString(renderMarkup("1. ITEM1\n2. ITEM2\n3. ITEM3"))).toBe("ITEM1 ITEM2 ITEM3");
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
