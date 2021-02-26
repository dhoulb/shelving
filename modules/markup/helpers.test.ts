import { markupToString, renderMarkup } from "..";

describe("plainNode()", () => {
	test("Nodes can be converted to plain text", () => {
		expect(markupToString(renderMarkup("PARAGRAPH"))).toBe("PARAGRAPH");
		expect(markupToString(renderMarkup("- ITEM1\n- ITEM2"))).toBe("ITEM1 ITEM2");
		expect(markupToString(renderMarkup("- ITEM\n  - ITEM1\n  - ITEM2"))).toBe("ITEM ITEM1 ITEM2");
		expect(markupToString(renderMarkup("1. ITEM1\n2. ITEM2\n3. ITEM3"))).toBe("ITEM1 ITEM2 ITEM3");
	});
});
