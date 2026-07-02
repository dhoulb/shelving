import { describe, expect, test } from "bun:test";
import { getBasedURI, getURL, isURL, isURLActive, isURLProud, matchURLPrefix, requireURL } from "shelving/util/url";

describe("isURL()", () => {
	test("returns true for URL instance", () => {
		expect(isURL(new URL("https://a.com"))).toBe(true);
	});
	test("returns false for string", () => {
		expect(isURL("https://a.com")).toBe(false);
	});
});
describe("getURL()", () => {
	test("returns URL for string", () => {
		const url = getURL("https://a.com");
		expect(url).toBeInstanceOf(URL);
		expect(url?.href).toBe("https://a.com/");
	});
	test("Check different types", () => {
		// expect(getURL("https://a.com")?.href).toBe("https://a.com/");
		// expect(getURL("feed://example.com/entries.atom")?.href).toBe("feed://example.com/entries.atom"); // Weirdly feed can be either.
		// expect(getURL("file://host/etc/fstab")?.href).toBe("file://host/etc/fstab");
		expect(getURL("file:///etc/fstab")?.href).toBe("file:///etc/fstab");
		expect(getURL("ftp://ftp.funet.fi/pub/standards/RFC/rfc959.txt")?.href).toBe("ftp://ftp.funet.fi/pub/standards/RFC/rfc959.txt");
		expect(getURL("https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Technical_overview")?.href).toBe(
			"https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Technical_overview",
		);
		expect(getURL("irc://irc.efnet.org:6667/DiscworldMUD")?.href).toBe("irc://irc.efnet.org:6667/DiscworldMUD");
		expect(getURL("telnet://rainmaker.wunderground.com")?.href).toBe("telnet://rainmaker.wunderground.com");
		expect(getURL("webcal://espn.go.com/travel/sports/calendar/export/espnCal?teams=6_23")?.href).toBe(
			"webcal://espn.go.com/travel/sports/calendar/export/espnCal?teams=6_23",
		);
		expect(getURL("ws://localhost:8080/websocket/wsserver")?.href).toBe("ws://localhost:8080/websocket/wsserver");
	});
	test("returns undefined for invalid string", () => {
		expect(getURL("not a url")).toBeUndefined();
	});
	test("returns URL when URL.parse is unavailable", () => {
		const ctor = URL as typeof URL & { parse?: (value: string | URL, base?: string | URL) => URL | null };
		const descriptor = Object.getOwnPropertyDescriptor(ctor, "parse");
		try {
			if (descriptor) Reflect.deleteProperty(ctor, "parse");
			const url = getURL("https://a.com");
			expect(url).toBeInstanceOf(URL);
			expect(url?.href).toBe("https://a.com/");
		} finally {
			if (descriptor) Object.defineProperty(ctor, "parse", descriptor);
		}
	});
});
describe("requireURL()", () => {
	test("returns URL for valid input", () => {
		expect(requireURL("https://a.com")).toBeInstanceOf(URL);
	});
	test("throws for invalid input", () => {
		expect(() => requireURL("not a url")).toThrow();
	});
});
describe("getBasedURI()", () => {
	test("returns a complete URL unchanged", () => {
		expect(getBasedURI("https://a.com/foo")?.href).toBe("https://a.com/foo");
	});
	test("returns a non-URL URI unchanged", () => {
		expect(getBasedURI("mailto:a@b")?.href).toBe("mailto:a@b");
	});
	test("returns a URL instance as-is", () => {
		const url = requireURL("https://a.com/foo");
		expect(getBasedURI(url)).toBe(url);
	});
	test("resolves a relative ref against the base", () => {
		expect(getBasedURI("./foo", "https://x.com/a/b/")?.href).toBe("https://x.com/a/b/foo");
	});
	test("treats the base as a directory even without a trailing slash", () => {
		// Same trailing-slash normalisation as getURL — the last segment is not dropped.
		expect(getBasedURI("./foo", "https://x.com/a/b")?.href).toBe("https://x.com/a/b/foo");
	});
	test("resolves a scheme-prefixed URI ignoring the base", () => {
		expect(getBasedURI("mailto:a@b", "https://x.com/a/")?.href).toBe("mailto:a@b");
	});
	test("returns undefined for a relative ref with no base", () => {
		expect(getBasedURI("./foo")).toBeUndefined();
	});
	test("returns undefined for nullish input", () => {
		expect(getBasedURI(undefined)).toBeUndefined();
		expect(getBasedURI(null)).toBeUndefined();
		expect(getBasedURI("")).toBeUndefined();
	});
});
describe("matchURLPrefix()", () => {
	test("resolves relative target against base and strips matched path", () => {
		expect(matchURLPrefix("def", "https://x.com/abc/")).toBe("/def");
		expect(matchURLPrefix("https://x.com/abc/def", "https://x.com/abc/")).toBe("/def");
		expect(matchURLPrefix("https://y.com/abc/def", "https://x.com/abc/")).toBeUndefined();
	});

	test("normalizes base path to directory semantics", () => {
		expect(matchURLPrefix("def", "https://x.com/abc")).toBe("/def");
		expect(matchURLPrefix("https://x.com/abc", "https://x.com/abc")).toBe("/");
	});

	test("normalizes a trailing slash on the target away", () => {
		// A trailing slash on the target resolves to the same path as the slash-less form.
		expect(matchURLPrefix("https://x.com/enquiry/loan/", "https://x.com/")).toBe("/enquiry/loan");
		expect(matchURLPrefix("https://x.com/enquiry/loan", "https://x.com/")).toBe("/enquiry/loan");
		expect(matchURLPrefix("https://x.com/abc/def/", "https://x.com/abc/")).toBe("/def");
		// The root `/` is preserved (it doesn't collapse to an empty string).
		expect(matchURLPrefix("https://x.com/", "https://x.com/")).toBe("/");
	});
});
describe("isURLActive()", () => {
	test("true when target equals base (after resolution)", () => {
		expect(isURLActive("https://x.com/users", "https://x.com/users")).toBe(true);
		expect(isURLActive("https://x.com/users/", "https://x.com/users")).toBe(true);
		expect(isURLActive("/users", "https://x.com/users")).toBe(true);
	});
	test("false when target is a descendant of base", () => {
		expect(isURLActive("https://x.com/users/123", "https://x.com/users")).toBe(false);
	});
	test("false when target is unrelated to base", () => {
		expect(isURLActive("https://x.com/posts", "https://x.com/users")).toBe(false);
	});
	test("false on origin mismatch", () => {
		expect(isURLActive("https://y.com/users", "https://x.com/users")).toBe(false);
	});
});

describe("isURLProud()", () => {
	test("true when target equals base", () => {
		expect(isURLProud("https://x.com/users", "https://x.com/users")).toBe(true);
	});
	test("true when target is a descendant of base", () => {
		expect(isURLProud("https://x.com/users/123", "https://x.com/users")).toBe(true);
		expect(isURLProud("https://x.com/users/123/edit", "https://x.com/users")).toBe(true);
		expect(isURLProud("/users/123", "https://x.com/users")).toBe(true);
	});
	test("true for any descendant of root", () => {
		expect(isURLProud("https://x.com/anything", "https://x.com/")).toBe(true);
	});
	test("false when target is an ancestor of base", () => {
		expect(isURLProud("https://x.com/", "https://x.com/users")).toBe(false);
	});
	test("false when target is unrelated to base", () => {
		expect(isURLProud("https://x.com/posts", "https://x.com/users")).toBe(false);
	});
	test("false on origin mismatch", () => {
		expect(isURLProud("https://y.com/users/123", "https://x.com/users")).toBe(false);
	});
});
