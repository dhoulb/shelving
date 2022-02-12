import { nodeToText, renderMarkup, yieldElements } from "../index.js";

describe("nodeToText()", () => {
	test("Nodes can be converted to plain text", () => {
		expect(nodeToText(renderMarkup("PARAGRAPH"))).toBe("PARAGRAPH");
		expect(nodeToText(renderMarkup("- ITEM1\n- ITEM2"))).toBe("ITEM1 ITEM2");
		expect(nodeToText(renderMarkup("- ITEM\n  - ITEM1\n  - ITEM2"))).toBe("ITEM ITEM1 ITEM2");
		expect(nodeToText(renderMarkup("1. ITEM1\n2. ITEM2\n3. ITEM3"))).toBe("ITEM1 ITEM2 ITEM3");
	});
});
test("yieldElements()", () => {
	expect(Array.from(yieldElements(renderMarkup("PARAGRAPH")))).toHaveLength(1);
	expect(Array.from(yieldElements(renderMarkup("PARAGRAPH")))).toMatchObject([{ type: "p" }]);
	expect(Array.from(yieldElements(renderMarkup("- ITEM1\n- ITEM2")))).toMatchObject([{ type: "ul" }, { type: "li", props: { children: "ITEM1" } }, { type: "li", props: { children: "ITEM2" } }]);
});
