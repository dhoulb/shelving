import { describe, expect, test } from "bun:test";
import type { ReactElement, ReactNode } from "react";
import type { JSXElement, JSXNode } from "../index.js";
import { getJSXNodeElements, getJSXNodeText } from "../index.js";

const P: JSXElement = {
	key: null,
	type: "p",
	props: {
		children: "PARAGRAPH",
	},
};

const UL: JSXElement = {
	key: null,
	type: "ul",
	props: {
		children: [
			{ key: null, type: "li", props: { children: "ITEM1" } },
			{ key: null, type: "li", props: { children: "ITEM2" } },
		],
	},
};

// JSX: types: check our custom JSX types are compatible with React's types
const a1: JSXElement = { type: "div", key: null, props: {} };
const a2: ReactElement = a1;
const a3: ReactNode = a1;
const b1: JSXNode = { type: "div", key: null, props: {} };
const b2: ReactNode = a1;

describe("getJSXNodeText()", () => {
	test("Nodes can be converted to plain text", () => {
		expect(getJSXNodeText(P)).toBe("PARAGRAPH");
		expect(getJSXNodeText(UL)).toBe("ITEM1 ITEM2");
	});
});
test("getJSXNodeElements()", () => {
	expect(Array.from(getJSXNodeElements(P))).toMatchObject([{ type: "p" }]);
	expect(Array.from(getJSXNodeElements(UL))).toMatchObject([
		{ type: "ul" },
		{ type: "li", props: { children: "ITEM1" } },
		{ type: "li", props: { children: "ITEM2" } },
	]);
});
