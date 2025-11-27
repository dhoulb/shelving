import { describe, expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { Feedback, NULLABLE_URI_SCHEMA, URI_SCHEMA, URISchema } from "../index.js";

// Tests.
test("TypeScript", () => {
	// Test url.optional
	const s1: Schema<string | null> = NULLABLE_URI_SCHEMA;
	const r1: string | null = s1.validate("https://test.com");

	// Test url.required
	const s2: Schema<string> = URI_SCHEMA;
	const r2: string = s2.validate("https://test.com");

	// Test schema.url({})
	const s3: Schema<string> = new URISchema({});
	const r3: string = s3.validate("https://test.com");
});
test("constructor()", () => {
	const schema1 = new URISchema({});
	expect(schema1).toBeInstanceOf(URISchema);
	const schema2 = URI_SCHEMA;
	expect(schema2).toBeInstanceOf(URISchema);
	const schema3 = URI_SCHEMA;
	expect(schema3).toBeInstanceOf(URISchema);
});
describe("validate()", () => {
	const schema = URI_SCHEMA;
	describe("URIs", () => {
		test("Valid URIs are valid.", () => {
			const u1 = "data:image/svg+xml;base64,SGVsbG8gd29ybGQ=";
			expect(new URISchema({ schemes: ["data:"] }).validate(u1)).toBe(u1);
			const u2 = "feed:https://example.com/entries.atom"; // Weirdly feed can be either.
			expect(new URISchema({ schemes: ["feed:"] }).validate(u2)).toBe(u2);
			const u3 = "feed://example.com/entries.atom"; // Weirdly feed can be either.
			expect(new URISchema({ schemes: ["feed:"] }).validate(u3)).toBe(u3);
			const u4 = "file:///etc/fstab";
			expect(new URISchema({ schemes: ["file:"] }).validate(u4)).toBe(u4);
			const u5 = "ftp://ftp.funet.fi/pub/standards/RFC/rfc959.txt";
			expect(new URISchema({ schemes: ["ftp:"] }).validate(u5)).toBe(u5);
			const u6 = "geo:37.786971;-122.399677";
			expect(new URISchema({ schemes: ["geo:"] }).validate(u6)).toBe(u6);
			const u7 = "https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Technical_overview";
			expect(new URISchema({ schemes: ["https:"] }).validate(u7)).toBe(u7);
			const u8 =
				"http://www.google.ps/search?hl=en&client=firefox-a&hs=42F&rls=org.mozilla%3Aen-US%3Aofficial&q=The+type+%27Microsoft.Practices.ObjectBuilder.Locator%27+is+defined+in+an+assembly+that+is+not+referenced.+You+must+add+a+reference+to+assembly+&aq=f&aqi=&aql=&oq=";
			expect(new URISchema({ schemes: ["http:"] }).validate(u8)).toBe(u8);
			const u9 = "irc://irc.efnet.org:6667/DiscworldMUD";
			expect(new URISchema({ schemes: ["irc:"] }).validate(u9)).toBe(u9);
			const u10 = "mailto:dave@shax.com";
			expect(new URISchema({ schemes: ["mailto:"] }).validate(u10)).toBe(u10);
			const u11 = "magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a&dn";
			expect(new URISchema({ schemes: ["magnet:"] }).validate(u11)).toBe(u11);
			const u12 = "tel:+44123456789";
			expect(new URISchema({ schemes: ["tel:"] }).validate(u12)).toBe(u12);
			const u13 = "telnet://rainmaker.wunderground.com";
			expect(new URISchema({ schemes: ["telnet:"] }).validate(u13)).toBe(u13);
			const u14 = "urn:isbn:0-486-27557-4";
			expect(new URISchema({ schemes: ["urn:"] }).validate(u14)).toBe(u14);
			const u15 = "webcal://espn.go.com/travel/sports/calendar/export/espnCal?teams=6_23";
			expect(new URISchema({ schemes: ["webcal:"] }).validate(u15)).toBe(u15);
			const u16 = "ws://localhost:8080/websocket/wsserver";
			expect(new URISchema({ schemes: ["ws:"] }).validate(u16)).toBe(u16);
		});
		test("Invalid URIs are invalid", () => {
			expect(() => schema.validate("user@")).toThrow(Feedback);
			expect(() => schema.validate(":port")).toThrow(Feedback);
		});
		test("Non-strings are invalid", () => {
			expect(() => schema.validate([])).toThrow(Feedback);
			expect(() => schema.validate({})).toThrow(Feedback);
			expect(() => schema.validate(true)).toThrow(Feedback);
			expect(() => schema.validate(null)).toThrow(Feedback);
			expect(() => schema.validate("")).toThrow(Feedback);
			expect(() => schema.validate(false)).toThrow(Feedback);
		});
	});
	describe("scheme", () => {
		test("Valid scheme is valid", () => {
			expect(schema.validate("http://x.com/")).toBe("http://x.com/");
			expect(schema.validate("https://x.com/")).toBe("https://x.com/");
		});
		test("Invalid scheme is invalid", () => {
			expect(() => schema.validate("data:x.com")).toThrow(Feedback);
			expect(() => schema.validate("$$$://x.com")).toThrow(Feedback);
		});
		test("Scheme is lowercased", () => {
			expect(schema.validate("HTTP://x.com/")).toBe("http://x.com/");
		});
	});
	describe("hostnames", () => {
		test("Valid hostnamess are valid", () => {
			expect(schema.validate("http://x.com/")).toBe("http://x.com/");
			expect(schema.validate("http://www.x.com/")).toBe("http://www.x.com/");
			expect(schema.validate("http://x.com/")).toBe("http://x.com/");
			expect(schema.validate("http://www.bbc.co.uk/")).toBe("http://www.bbc.co.uk/");
			expect(schema.validate("http://www.british-library.co.uk/")).toBe("http://www.british-library.co.uk/");
		});
		test("Domains have // inserted if missing", () => {
			expect(schema.validate("http:x.com/")).toBe("http://x.com/");
			expect(schema.validate("https:x.com/")).toBe("https://x.com/");
		});
		test("Internationalised (IDN) labels are valid", () => {
			expect(schema.validate("http://xn--ngbrx.com/")).toBe("http://xn--ngbrx.com/");
		});
		test("Internationalised (IDN) TLDs are valid", () => {
			expect(schema.validate("http://a.xn--ngbrx/")).toBe("http://a.xn--ngbrx/");
			expect(schema.validate("http://a.xn--clchc0ea0b2g2a9gcd/")).toBe("http://a.xn--clchc0ea0b2g2a9gcd/");
			expect(schema.validate("http://a.xn--mgbai9azgqp6j/")).toBe("http://a.xn--mgbai9azgqp6j/");
			expect(schema.validate("http://a.xn--vermgensberater-ctb/")).toBe("http://a.xn--vermgensberater-ctb/");
		});
		test("Custom TLDs are valid", () => {
			expect(schema.validate("http://a.datsun/")).toBe("http://a.datsun/");
			expect(schema.validate("http://a.deloitte/")).toBe("http://a.deloitte/");
			expect(schema.validate("http://a.goodhands/")).toBe("http://a.goodhands/");
			expect(schema.validate("http://a.northwesternmutual/")).toBe("http://a.northwesternmutual/");
		});
		test("Hostnames with one label are valid (different to domains)", () => {
			expect(schema.validate("http://localhost/")).toBe("http://localhost/");
		});
		test("Hostnames are lowercased", () => {
			expect(schema.validate("http://WWW.X.COM/")).toBe("http://www.x.com/");
		});
		test("Hostnames are lowercased", () => {
			expect(schema.validate("http://WWW.X.COM/")).toBe("http://www.x.com/");
		});
		test("Wwhitespace is trimmed from start/end", () => {
			expect(schema.validate("    http://www.x.com/   ")).toBe("http://www.x.com/");
		});
	});
	describe("port", () => {
		test("Valid ports are valid", () => {
			expect(schema.validate("http://x.com:21/")).toBe("http://x.com:21/");
			expect(schema.validate("http://x.com:8686/")).toBe("http://x.com:8686/");
			expect(schema.validate("http://x.com:65535/")).toBe("http://x.com:65535/");
		});
		test("Port leading zeroes are stripped", () => {
			expect(schema.validate("http://x.com:000021/")).toBe("http://x.com:21/");
			expect(schema.validate("http://x.com:000065535/")).toBe("http://x.com:65535/");
		});
		test("Ports lower than 1 are invalid", () => {
			expect(() => schema.validate("http://x.com:-20000/")).toThrow(Feedback);
		});
		test("Ports higher than 65,535 are invalid", () => {
			expect(() => schema.validate("http://x.com:65536")).toThrow(Feedback);
			expect(() => schema.validate("http://x.com:283999482")).toThrow(Feedback);
		});
		test("Ports that are non-numeric are invalid", () => {
			expect(() => schema.validate("http://x.com:abc")).toThrow(Feedback);
		});
	});
	describe("length", () => {
		test("URI shorter than 1024 chars is valid", () => {
			expect(schema.validate("http://x.com/a/b/c")).toBe("http://x.com/a/b/c");
		});
		test("URIs that are more than 1024 chars are invalid", () => {
			const chars1025 = "1".repeat(1025);
			const longUrl = `http://x.com/?long=${chars1025}`;
			expect(() => schema.validate(longUrl)).toThrow(Feedback);
		});
	});
});
describe("options.value", () => {
	test("Undefined default value is invalid", () => {
		const schema = URI_SCHEMA;
		expect(() => schema.validate(undefined)).toThrow(Feedback);
	});
	test("Undefined with default value returns default value", () => {
		const schema = new URISchema({ value: "http://x.com/" });
		expect(schema.validate(undefined)).toBe("http://x.com/");
	});
});
describe("options.schemes", () => {
	test("Scheme in default whitelist is allowed", () => {
		const schema = NULLABLE_URI_SCHEMA;
		expect(schema.validate("http://x.com/")).toBe("http://x.com/");
		expect(schema.validate("https://x.com/")).toBe("https://x.com/");
	});
	test("Scheme not in default whitelist is invalid", () => {
		const schema = NULLABLE_URI_SCHEMA;
		expect(() => schema.validate("webcal://x.com")).toThrow(Feedback);
	});
	test("Scheme in specified whitelist is valid", () => {
		const schema = new URISchema({ schemes: ["telnet:"] });
		expect(schema.validate("telnet://x.com")).toBe("telnet://x.com");
	});
	test("Scheme not in specified whitelist is invalid", () => {
		const schema = new URISchema({ schemes: ["telnet:"] });
		expect(() => schema.validate("webcal://x.com:")).toThrow(Feedback);
	});
});
