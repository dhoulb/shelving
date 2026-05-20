import { describe, expect, test } from "bun:test";
import { getLink, type ImmutableURI, RequiredError, requireLink, requireURL } from "../index.js";

const ROOT = requireURL("https://x.com/app/");
const ROOT_NO_SLASH = requireURL("https://x.com/app");
const PAGE = requireURL("https://x.com/app/schema/");

describe("getLink()", () => {
	describe("URL instance", () => {
		test("returns its href", () => {
			expect(getLink(requireURL("https://other.com/foo"))).toEqual(new URL("https://other.com/foo") as ImmutableURI);
		});
		test("returns its href ignoring url and root", () => {
			expect(getLink(requireURL("https://other.com/foo"), PAGE, ROOT)).toEqual(new URL("https://other.com/foo") as ImmutableURI);
		});
		test("returns mailto: href as-is", () => {
			expect(getLink(new URL("mailto:a@b"))).toEqual(new URL("mailto:a@b") as ImmutableURI);
		});
	});

	describe("absolute path", () => {
		test("resolves against root honoring its subfolder", () => {
			expect(getLink("/schema", PAGE, ROOT)).toEqual(new URL("https://x.com/app/schema") as ImmutableURI);
		});
		test("resolves nested absolute path against root", () => {
			expect(getLink("/schema/db", PAGE, ROOT)).toEqual(new URL("https://x.com/app/schema/db") as ImmutableURI);
		});
		test("resolves root against root", () => {
			expect(getLink("/", PAGE, ROOT)).toEqual(new URL("https://x.com/app/") as ImmutableURI);
		});
		test("handles root without trailing slash", () => {
			// getURL normalises base to a trailing-slash BaseURL internally.
			expect(getLink("/schema", PAGE, ROOT_NO_SLASH)).toEqual(new URL("https://x.com/app/schema") as ImmutableURI);
		});
		test("ignores url when root is given", () => {
			expect(getLink("/schema", requireURL("https://other.com/page/"), ROOT)).toEqual(new URL("https://x.com/app/schema") as ImmutableURI);
		});
		test("defaults root to url when root is omitted, resolving under url's directory", () => {
			// PAGE is "https://x.com/app/schema/" — absolute paths resolve under it.
			expect(getLink("/db", PAGE)).toEqual(new URL("https://x.com/app/schema/db") as ImmutableURI);
		});
		test("returns undefined when neither url nor root given", () => {
			expect(getLink("/schema")).toBeUndefined();
		});
	});

	describe("scheme-prefixed URI", () => {
		test("returns mailto: as-is", () => {
			expect(getLink("mailto:a@b", PAGE, ROOT)).toEqual(new URL("mailto:a@b") as ImmutableURI);
		});
		test("returns tel: as-is", () => {
			expect(getLink("tel:+44123", PAGE, ROOT)).toEqual(new URL("tel:+44123") as ImmutableURI);
		});
		test("returns external https URL as-is", () => {
			expect(getLink("https://other.com/foo", PAGE, ROOT)).toEqual(new URL("https://other.com/foo") as ImmutableURI);
		});
		test("returns http URL ignoring url and root", () => {
			expect(getLink("http://other.com/foo", PAGE, ROOT)).toEqual(new URL("http://other.com/foo") as ImmutableURI);
		});
		test("resolves protocol-relative URL against url's protocol", () => {
			expect(getLink("//other.com/foo", PAGE, ROOT)).toEqual(new URL("https://other.com/foo") as ImmutableURI);
		});
		test("ignores document base for scheme classification", () => {
			// Even though a relative path containing a colon could resolve via document.baseURI in browsers,
			// scheme detection should be deterministic — only true scheme-prefixed strings pass through.
			expect(getLink("mailto:a@b")).toEqual(new URL("mailto:a@b") as ImmutableURI);
		});
	});

	describe("relative ref", () => {
		test("resolves ./foo against url", () => {
			expect(getLink("./db", PAGE, ROOT)).toEqual(new URL("https://x.com/app/schema/db") as ImmutableURI);
		});
		test("resolves ../foo against url", () => {
			expect(getLink("../other", PAGE, ROOT)).toEqual(new URL("https://x.com/app/other") as ImmutableURI);
		});
		test("resolves bare segment against url", () => {
			expect(getLink("db", PAGE, ROOT)).toEqual(new URL("https://x.com/app/schema/db") as ImmutableURI);
		});
		test("resolves fragment against url", () => {
			expect(getLink("#anchor", PAGE, ROOT)).toEqual(new URL("https://x.com/app/schema/#anchor") as ImmutableURI);
		});
		test("resolves query against url", () => {
			expect(getLink("?q=1", PAGE, ROOT)).toEqual(new URL("https://x.com/app/schema/?q=1") as ImmutableURI);
		});
		test("falls back to root when no url given", () => {
			expect(getLink("./db", undefined, ROOT)).toEqual(new URL("https://x.com/app/db") as ImmutableURI);
		});
		test("returns undefined when neither url nor root given", () => {
			expect(getLink("./db")).toBeUndefined();
		});
	});

	describe("invalid input", () => {
		test("returns undefined for empty string", () => {
			expect(getLink("", PAGE, ROOT)).toBeUndefined();
		});
		test("returns undefined for null", () => {
			expect(getLink(null, PAGE, ROOT)).toBeUndefined();
		});
		test("returns undefined for undefined", () => {
			expect(getLink(undefined, PAGE, ROOT)).toBeUndefined();
		});
		test("returns undefined for number", () => {
			expect(getLink(123, PAGE, ROOT)).toBeUndefined();
		});
		test("returns undefined for object", () => {
			expect(getLink({ href: "/foo" }, PAGE, ROOT)).toBeUndefined();
		});
	});
});

describe("requireLink()", () => {
	test("returns resolved href", () => {
		expect(requireLink("/schema", PAGE, ROOT)).toEqual(new URL("https://x.com/app/schema") as ImmutableURI);
	});
	test("returns mailto: as-is", () => {
		expect(requireLink("mailto:a@b", PAGE, ROOT)).toEqual(new URL("mailto:a@b") as ImmutableURI);
	});
	test("throws RequiredError for empty string", () => {
		expect(() => requireLink("" as never, PAGE, ROOT)).toThrow(RequiredError);
	});
	test("throws RequiredError when absolute path has no base at all", () => {
		expect(() => requireLink("/schema")).toThrow(RequiredError);
	});
});
