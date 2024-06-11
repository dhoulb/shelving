import { expect, test } from "bun:test";
import type { JSXElement } from "../../util/jsx.js";
import { MARKUP_RULES, renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.element");
const OPTIONS = {
	rules: MARKUP_RULES,
};

test("AUTOLINK_RULE", () => {
	// Normal link with title.
	expect(renderMarkup("http://google.com (Google)", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: "Google" },
	});

	// Normal link without title.
	expect(renderMarkup("http://google.com", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: "google.com" },
	});
	expect(renderMarkup("http://google.com ()", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: "google.com" },
	});

	// Links use the `rel` from the passed in context.
	expect(renderMarkup("http://google.com (Google)", { ...OPTIONS, rel: "nofollow ugc" }, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: "Google", rel: "nofollow ugc" },
	});
	expect(renderMarkup("http://google.com", { ...OPTIONS, rel: "nofollow ugc" }, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: "google.com", rel: "nofollow ugc" },
	});

	// Links can contain other inlines.
	expect(renderMarkup("http://google.com (BEFORE *STRONG* AFTER)", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: ["BEFORE ", { $$typeof, type: "strong", props: { children: "STRONG" } }, " AFTER"] },
	});
	expect(renderMarkup("http://google.com (BEFORE _EM_ AFTER)", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: ["BEFORE ", { $$typeof, type: "em", props: { children: "EM" } }, " AFTER"] },
	});

	// Explicit links don't turn their children into autolinks.
	expect(renderMarkup("[http://google.com](http://google.com)", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: "http://google.com" },
	});

	// Autolinks cannot contain other autolinked URLs.
	expect(renderMarkup("http://google.com (http://google.com)", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: "http://google.com" },
	});

	// Links using schemes not in the whitelist are not linked.
	expect(renderMarkup("mailto:dave@shax.com", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { children: "dave@shax.com" },
	});
	expect((renderMarkup("mailto:dave@shax.com", OPTIONS, "inline") as JSXElement).props.href).toBe(undefined);

	// Links using schemes in whitelist are linked.
	expect(renderMarkup("ftp://localhost/a/b", { ...OPTIONS, schemes: ["ftp:"] }, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "ftp://localhost/a/b", children: "localhost/a/b" },
	});
});

test("LINK_RULE", () => {
	// Normal link.
	expect(renderMarkup("[Google](http://google.com)", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: "Google" },
	});

	// Normal link without title.
	expect(renderMarkup("[](http://google.com)", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: "google.com" },
	});

	// Links use the `rel` from the passed in context.
	expect(renderMarkup("[Google](http://google.com)", { ...OPTIONS, rel: "nofollow ugc" }, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: "Google", rel: "nofollow ugc" },
	});
	expect(renderMarkup("[](http://google.com)", { ...OPTIONS, rel: "nofollow ugc" }, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: "google.com", rel: "nofollow ugc" },
	});

	// `href` can be empty.
	expect(renderMarkup("[LINK]()", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { children: "LINK" },
	});
	expect((renderMarkup("[LINK]()", OPTIONS, "inline") as JSXElement).props.href).toBe(undefined);
	expect(renderMarkup("[]()", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { children: "" },
	});
	expect((renderMarkup("[]()", OPTIONS, "inline") as JSXElement).props.href).toBe(undefined);

	// `href` strips whitespace.
	expect(renderMarkup("[Google](\t  http://google.com  \t)", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "http://google.com/", children: "Google" },
	});

	// Relative links use `base` from the passed in context.
	expect(renderMarkup("[XXX](a/b/c)", { ...OPTIONS, base: "https://x.com" }, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "https://x.com/a/b/c", children: "XXX" },
	});
	expect(renderMarkup("[](a/b/c)", { ...OPTIONS, base: "https://x.com" }, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "https://x.com/a/b/c", children: "x.com/a/b/c" },
	});

	// Links can contain other inlines.
	expect(renderMarkup("[BEFORE *STRONG* AFTER](http://google.com)", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: {
			href: "http://google.com/",
			children: ["BEFORE ", { $$typeof, type: "strong", props: { children: "STRONG" } }, " AFTER"],
		},
	});
	expect(renderMarkup("[BEFORE _EM_ AFTER](http://google.com)", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: {
			href: "http://google.com/",
			children: ["BEFORE ", { $$typeof, type: "em", props: { children: "EM" } }, " AFTER"],
		},
	});

	// Links using schemes not in the whitelist are not linked.
	expect(renderMarkup("[NOPE](mailto:dave@shax.com)", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { children: "NOPE" },
	});
	expect((renderMarkup("[NOPE](mailto:dave@shax.com)", OPTIONS, "inline") as JSXElement).props.href).toBe(undefined);

	// Links using schemes in whitelist are linked.
	expect(renderMarkup("[YEP](mailto:dave@shax.com)", { ...OPTIONS, schemes: ["mailto:"] }, "inline")).toMatchObject({
		$$typeof,
		type: "a",
		props: { href: "mailto:dave@shax.com", children: "YEP" },
	});
});
