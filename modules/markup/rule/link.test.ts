import { expect, test } from "bun:test";
import { type Element, type ElementProps, requireURL } from "../../index.js";
import { MarkupParser } from "../index.js";

const PARSER = new MarkupParser();
const NOFOLLOW_PARSER = new MarkupParser({ rel: "nofollow ugc" });
const URL_PARSER = new MarkupParser({ url: requireURL("https://x.com") });
const PATH_PARSER = new MarkupParser({ url: requireURL("https://x.com/app/") });
const FTP_PARSER = new MarkupParser({ schemes: ["ftp:"] });
const MAILTO_PARSER = new MarkupParser({ schemes: ["mailto:"] });

test("AUTOLINK_RULE", () => {
	// Normal link with title.
	expect(PARSER.parse("http://google.com (Google)", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: "Google" },
	});

	// Normal link without title.
	expect(PARSER.parse("http://google.com", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: "google.com" },
	});
	expect(PARSER.parse("http://google.com ()", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: "google.com" },
	});

	// Links use the `rel` from the passed in context.
	expect(NOFOLLOW_PARSER.parse("http://google.com (Google)", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: "Google", rel: "nofollow ugc" },
	});
	expect(NOFOLLOW_PARSER.parse("http://google.com", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: "google.com", rel: "nofollow ugc" },
	});

	// Links can contain other inlines.
	expect(PARSER.parse("http://google.com (BEFORE *STRONG* AFTER)", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
	});
	expect(PARSER.parse("http://google.com (BEFORE _EM_ AFTER)", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: ["BEFORE ", { type: "em", props: { children: "EM" } }, " AFTER"] },
	});

	// Explicit links don't turn their children into autolinks.
	expect(PARSER.parse("[http://google.com](http://google.com)", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: "http://google.com" },
	});

	// Autolinks cannot contain other autolinked URLs.
	expect(PARSER.parse("http://google.com (http://google.com)", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: "http://google.com" },
	});

	// Links using schemes not in the whitelist are not linked.
	expect(MAILTO_PARSER.parse("mailto:dave@shax.com", "inline")).toMatchObject({
		type: "a",
		props: { children: "dave@shax.com" },
	});
	expect((PARSER.parse("mailto:dave@shax.com", "inline") as Element<ElementProps & { href?: string }>).props.href).toBe(undefined);

	// Links using schemes in whitelist are linked.
	expect(FTP_PARSER.parse("ftp://localhost/a/b", "inline")).toMatchObject({
		type: "a",
		props: { href: "ftp://localhost/a/b", children: "localhost/a/b" },
	});
});

test("LINK_RULE", () => {
	// Normal link.
	expect(PARSER.parse("[Google](http://google.com)", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: "Google" },
	});

	// Normal link without title.
	expect(PARSER.parse("[](http://google.com)", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: "google.com" },
	});

	// Links use the `rel` from the passed in context.
	expect(NOFOLLOW_PARSER.parse("[Google](http://google.com)", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: "Google", rel: "nofollow ugc" },
	});
	expect(NOFOLLOW_PARSER.parse("[](http://google.com)", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: "google.com", rel: "nofollow ugc" },
	});

	// `href` can be empty.
	expect(PARSER.parse("[LINK]()", "inline")).toMatchObject({
		type: "a",
		props: { children: "LINK" },
	});
	expect((PARSER.parse("[LINK]()", "inline") as Element<ElementProps & { href?: string }>).props.href).toBe(undefined);
	expect(PARSER.parse("[]()", "inline")).toMatchObject({
		type: "a",
		props: { children: "" },
	});
	expect((PARSER.parse("[]()", "inline") as Element<ElementProps & { href?: string }>).props.href).toBe(undefined);

	// `href` strips whitespace.
	expect(PARSER.parse("[Google](\t  http://google.com  \t)", "inline")).toMatchObject({
		type: "a",
		props: { href: "http://google.com/", children: "Google" },
	});

	// Relative links use `url` from the passed in context.
	expect(URL_PARSER.parse("[XXX](a/b/c)", "inline")).toMatchObject({
		type: "a",
		props: { href: "https://x.com/a/b/c", children: "XXX" },
	});
	expect(URL_PARSER.parse("[](a/b/c)", "inline")).toMatchObject({
		type: "a",
		props: { href: "https://x.com/a/b/c", children: "x.com/a/b/c" },
	});

	// Site-absolute paths use `root` from the passed in context — honoring its subfolder.
	expect(PATH_PARSER.parse("[Schema](/schema)", "inline")).toMatchObject({
		type: "a",
		props: { href: "https://x.com/app/schema", children: "Schema" },
	});

	// Links can contain other inlines.
	expect(PARSER.parse("[BEFORE *STRONG* AFTER](http://google.com)", "inline")).toMatchObject({
		type: "a",
		props: {
			href: "http://google.com/",
			children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"],
		},
	});
	expect(PARSER.parse("[BEFORE _EM_ AFTER](http://google.com)", "inline")).toMatchObject({
		type: "a",
		props: {
			href: "http://google.com/",
			children: ["BEFORE ", { type: "em", props: { children: "EM" } }, " AFTER"],
		},
	});

	// Links using schemes not in the whitelist are not linked.
	expect(PARSER.parse("[NOPE](mailto:dave@shax.com)", "inline")).toMatchObject({
		type: "a",
		props: { children: "NOPE" },
	});
	expect((PARSER.parse("[NOPE](mailto:dave@shax.com)", "inline") as Element<ElementProps & { href?: string }>).props.href).toBe(undefined);

	// Links using schemes in whitelist are linked.
	expect(MAILTO_PARSER.parse("[YEP](mailto:dave@shax.com)", "inline")).toMatchObject({
		type: "a",
		props: { href: "mailto:dave@shax.com", children: "YEP" },
	});
});
