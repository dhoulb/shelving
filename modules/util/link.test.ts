import { describe, expect, test } from "bun:test";
import { RequiredError } from "../error/RequiredError.js";
import { getLink, requireLink, requireURL } from "../index.js";

const ROOT = requireURL("https://x.com/app/");
const ROOT_NO_SLASH = requireURL("https://x.com/app");
const PAGE = requireURL("https://x.com/app/schema/");

describe("getLink()", () => {
	describe("URL instance", () => {
		test("returns its href", () => {
			expect(getLink(requireURL("https://other.com/foo"))).toBe("https://other.com/foo");
		});
		test("returns its href ignoring url and root", () => {
			expect(getLink(requireURL("https://other.com/foo"), PAGE, ROOT)).toBe("https://other.com/foo");
		});
		test("returns mailto: href as-is", () => {
			expect(getLink(new URL("mailto:a@b"))).toBe("mailto:a@b");
		});
	});

	describe("absolute path", () => {
		test("resolves against root honoring its subfolder", () => {
			expect(getLink("/schema", PAGE, ROOT)).toBe("https://x.com/app/schema");
		});
		test("resolves nested absolute path against root", () => {
			expect(getLink("/schema/db", PAGE, ROOT)).toBe("https://x.com/app/schema/db");
		});
		test("resolves root against root", () => {
			expect(getLink("/", PAGE, ROOT)).toBe("https://x.com/app/");
		});
		test("handles root without trailing slash", () => {
			// getURL normalises base to a trailing-slash BaseURL internally.
			expect(getLink("/schema", PAGE, ROOT_NO_SLASH)).toBe("https://x.com/app/schema");
		});
		test("ignores url when root is given", () => {
			expect(getLink("/schema", requireURL("https://other.com/page/"), ROOT)).toBe("https://x.com/app/schema");
		});
		test("defaults root to url when root is omitted, resolving under url's directory", () => {
			// PAGE is "https://x.com/app/schema/" — absolute paths resolve under it.
			expect(getLink("/db", PAGE)).toBe("https://x.com/app/schema/db");
		});
		test("returns undefined when neither url nor root given", () => {
			expect(getLink("/schema")).toBeUndefined();
		});
	});

	describe("scheme-prefixed URI", () => {
		test("returns mailto: as-is", () => {
			expect(getLink("mailto:a@b", PAGE, ROOT)).toBe("mailto:a@b");
		});
		test("returns tel: as-is", () => {
			expect(getLink("tel:+44123", PAGE, ROOT)).toBe("tel:+44123");
		});
		test("returns external https URL as-is", () => {
			expect(getLink("https://other.com/foo", PAGE, ROOT)).toBe("https://other.com/foo");
		});
		test("returns http URL ignoring url and root", () => {
			expect(getLink("http://other.com/foo", PAGE, ROOT)).toBe("http://other.com/foo");
		});
		test("ignores document base for scheme classification", () => {
			// Even though a relative path containing a colon could resolve via document.baseURI in browsers,
			// scheme detection should be deterministic — only true scheme-prefixed strings pass through.
			expect(getLink("mailto:a@b")).toBe("mailto:a@b");
		});
	});

	describe("relative ref", () => {
		test("resolves ./foo against url", () => {
			expect(getLink("./db", PAGE, ROOT)).toBe("https://x.com/app/schema/db");
		});
		test("resolves ../foo against url", () => {
			expect(getLink("../other", PAGE, ROOT)).toBe("https://x.com/app/other");
		});
		test("resolves bare segment against url", () => {
			expect(getLink("db", PAGE, ROOT)).toBe("https://x.com/app/schema/db");
		});
		test("resolves fragment against url", () => {
			expect(getLink("#anchor", PAGE, ROOT)).toBe("https://x.com/app/schema/#anchor");
		});
		test("resolves query against url", () => {
			expect(getLink("?q=1", PAGE, ROOT)).toBe("https://x.com/app/schema/?q=1");
		});
		test("falls back to root when no url given", () => {
			expect(getLink("./db", undefined, ROOT)).toBe("https://x.com/app/db");
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
		expect(requireLink("/schema", PAGE, ROOT)).toBe("https://x.com/app/schema");
	});
	test("returns mailto: as-is", () => {
		expect(requireLink("mailto:a@b", PAGE, ROOT)).toBe("mailto:a@b");
	});
	test("throws RequiredError for empty string", () => {
		expect(() => requireLink("" as never, PAGE, ROOT)).toThrow(RequiredError);
	});
	test("throws RequiredError when absolute path has no base at all", () => {
		expect(() => requireLink("/schema")).toThrow(RequiredError);
	});
});
