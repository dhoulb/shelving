import { describe, expect, test } from "bun:test";
import { getURL, isURL, matchURLPrefix, requireURL } from "../index.js";

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
});
