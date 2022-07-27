import { getJSXNodeText, renderMarkup, getJSXNodeElements } from "../index.js";
import type { JSXElement, JSXNode } from "../index.js";

test("JSX: types: check our custom JSX types are compatible with React's types", () => {
	const a1: JSXElement = { type: "div", key: null, ref: null, props: {} };
	const a2: React.ReactElement = a1;
	const b1: JSXNode = { type: "div", key: null, ref: null, props: {} };
	const b2: React.ReactNode = a1;
});
describe("getJSXNodeText()", () => {
	test("Nodes can be converted to plain text", () => {
		expect(getJSXNodeText(renderMarkup("PARAGRAPH"))).toBe("PARAGRAPH");
		expect(getJSXNodeText(renderMarkup("- ITEM1\n- ITEM2"))).toBe("ITEM1 ITEM2");
		expect(getJSXNodeText(renderMarkup("- ITEM\n\t- ITEM1\n\t- ITEM2"))).toBe("ITEM ITEM1 ITEM2");
		expect(getJSXNodeText(renderMarkup("1. ITEM1\n2. ITEM2\n3. ITEM3"))).toBe("ITEM1 ITEM2 ITEM3");
	});
});
test("getJSXNodeElements()", () => {
	expect(Array.from(getJSXNodeElements(renderMarkup("PARAGRAPH")))).toHaveLength(1);
	expect(Array.from(getJSXNodeElements(renderMarkup("PARAGRAPH")))).toMatchObject([{ type: "p" }]);
	expect(Array.from(getJSXNodeElements(renderMarkup("- ITEM1\n- ITEM2")))).toMatchObject([{ type: "ul" }, { type: "li", props: { children: "ITEM1" } }, { type: "li", props: { children: "ITEM2" } }]);
});
