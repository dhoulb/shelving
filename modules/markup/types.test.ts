import { createElement } from "react";
import type { MarkupElement, MarkupElementCreator, MarkupNode } from "..";

test("Markup: types: check our custom JSX types are compatible with React's types", () => {
	const a1: MarkupElement = { type: "div", key: null, props: {} };
	const a2: React.ReactElement = a1;
	const b1: MarkupNode = { type: "div", key: null, props: {} };
	const b2: React.ReactNode = a1;
	const c1: MarkupElementCreator = createElement;
});
