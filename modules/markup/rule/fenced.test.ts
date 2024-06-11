import { expect, test } from "bun:test";
import { MARKUP_RULES, renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.element");
const OPTIONS = {
	rules: MARKUP_RULES,
};

test("FENCED_RULE", () => {
	// Basic fenced block.
	expect(renderMarkup("```\nLINE1\nLINE2\n```", OPTIONS)).toMatchObject({
		$$typeof,
		type: "pre",
		props: {
			children: { $$typeof, type: "code", props: { children: "LINE1\nLINE2" } },
		},
	});
	expect(renderMarkup("``````\nLINE1\nLINE2\n``````", OPTIONS)).toMatchObject({
		$$typeof,
		type: "pre",
		props: {
			children: { $$typeof, type: "code", props: { children: "LINE1\nLINE2" } },
		},
	});
	expect(renderMarkup("~~~\nLINE1\nLINE2\n~~~", OPTIONS)).toMatchObject({
		$$typeof,
		type: "pre",
		props: {
			children: { $$typeof, type: "code", props: { children: "LINE1\nLINE2" } },
		},
	});
	expect(renderMarkup("~~~~~~\nLINE1\nLINE2\n~~~~~~", OPTIONS)).toMatchObject({
		$$typeof,
		type: "pre",
		props: {
			children: { $$typeof, type: "code", props: { children: "LINE1\nLINE2" } },
		},
	});
	expect(renderMarkup("```\nLINE1\nLINE2", OPTIONS)).toMatchObject({
		$$typeof,
		type: "pre",
		props: {
			children: { $$typeof, type: "code", props: { children: "LINE1\nLINE2" } },
		},
	}); // No close (runs to the end of the string).

	// With filename.
	expect(renderMarkup("```file.js\nLINE1\nLINE2\n```", OPTIONS)).toMatchObject({
		$$typeof,
		type: "pre",
		props: { children: { $$typeof, type: "code", props: { title: "file.js", children: "LINE1\nLINE2" } } },
	});

	// Whitespace around name is stripped.
	expect(renderMarkup("```    file.js    \nLINE1\nLINE2\n```", OPTIONS)).toMatchObject({
		$$typeof,
		type: "pre",
		props: { children: { $$typeof, type: "code", props: { title: "file.js", children: "LINE1\nLINE2" } } },
	});
	expect(renderMarkup("```\t\tfile.js\t\t\nLINE1\nLINE2\n```", OPTIONS)).toMatchObject({
		$$typeof,
		type: "pre",
		props: { children: { $$typeof, type: "code", props: { title: "file.js", children: "LINE1\nLINE2" } } },
	});

	// Newlines before/after are stripped.
	expect(renderMarkup("\n   \n```\nLINE1\nLINE2\n```\n   \n", OPTIONS)).toMatchObject({
		$$typeof,
		type: "pre",
		props: { children: { $$typeof, type: "code", props: { children: "LINE1\nLINE2" } } },
	});

	// Fenced does not nest other markup.
	expect(renderMarkup("```\n- ITEM1\n*STRONG*\n```", OPTIONS)).toMatchObject({
		$$typeof,
		type: "pre",
		props: {
			children: { $$typeof, type: "code", props: { children: "- ITEM1\n*STRONG*" } },
		},
	});
});
