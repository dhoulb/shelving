import { describe, expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { Feedback, LINK, LinkSchema, NULLABLE_LINK } from "../index.js";

// Tests.
test("TypeScript", () => {
	// Test url.optional
	const s1: Schema<string | null> = NULLABLE_LINK;
	const r1: string | null = s1.validate("https://test.com");

	// Test url.required
	const s2: Schema<string> = LINK;
	const r2: string = s2.validate("https://test.com");

	// Test schema.url({})
	const s3: Schema<string> = new LinkSchema({});
	const r3: string = s3.validate("https://test.com");
});
test("constructor()", () => {
	const schema1 = new LinkSchema({});
	expect(schema1).toBeInstanceOf(LinkSchema);
	const schema2 = LINK;
	expect(schema2).toBeInstanceOf(LinkSchema);
	const schema3 = LINK;
	expect(schema3).toBeInstanceOf(LinkSchema);
});
describe("validate()", () => {
	const schema = LINK;
	describe("URLs", () => {
		test("Valid URLs are valid.", () => {
			const u1 = "data:image/svg+xml;base64,SGVsbG8gd29ybGQ=";
			expect(new LinkSchema({ schemes: ["data:"] }).validate(u1)).toBe(u1);
			const u2 = "feed:https://example.com/entries.atom"; // Weirdly feed can be either.
			expect(new LinkSchema({ schemes: ["feed:"] }).validate(u2)).toBe(u2);
			const u3 = "feed://example.com/entries.atom"; // Weirdly feed can be either.
			expect(new LinkSchema({ schemes: ["feed:"] }).validate(u3)).toBe(u3);
			const u4 = "file:///etc/fstab";
			expect(new LinkSchema({ schemes: ["file:"] }).validate(u4)).toBe(u4);
			const u5 = "ftp://ftp.funet.fi/pub/standards/RFC/rfc959.txt";
			expect(new LinkSchema({ schemes: ["ftp:"] }).validate(u5)).toBe(u5);
			const u6 = "geo:37.786971;-122.399677";
			expect(new LinkSchema({ schemes: ["geo:"] }).validate(u6)).toBe(u6);
			const u7 = "https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Technical_overview";
			expect(new LinkSchema({ schemes: ["https:"] }).validate(u7)).toBe(u7);
			const u8 =
				"http://www.google.ps/search?hl=en&client=firefox-a&hs=42F&rls=org.mozilla%3Aen-US%3Aofficial&q=The+type+%27Microsoft.Practices.ObjectBuilder.Locator%27+is+defined+in+an+assembly+that+is+not+referenced.+You+must+add+a+reference+to+assembly+&aq=f&aqi=&aql=&oq=";
			expect(new LinkSchema({ schemes: ["http:"] }).validate(u8)).toBe(u8);
			const u9 = "irc://irc.efnet.org:6667/DiscworldMUD";
			expect(new LinkSchema({ schemes: ["irc:"] }).validate(u9)).toBe(u9);
			const u10 = "mailto:dave@shax.com";
			expect(new LinkSchema({ schemes: ["mailto:"] }).validate(u10)).toBe(u10);
			const u11 = "magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a&dn";
			expect(new LinkSchema({ schemes: ["magnet:"] }).validate(u11)).toBe(u11);
			const u12 = "tel:+44123456789";
			expect(new LinkSchema({ schemes: ["tel:"] }).validate(u12)).toBe(u12);
			const u13 = "telnet://rainmaker.wunderground.com";
			expect(new LinkSchema({ schemes: ["telnet:"] }).validate(u13)).toBe(u13);
			const u14 = "urn:isbn:0-486-27557-4";
			expect(new LinkSchema({ schemes: ["urn:"] }).validate(u14)).toBe(u14);
			const u15 = "webcal://espn.go.com/travel/sports/calendar/export/espnCal?teams=6_23";
			expect(new LinkSchema({ schemes: ["webcal:"] }).validate(u15)).toBe(u15);
			const u16 = "ws://localhost:8080/websocket/wsserver";
			expect(new LinkSchema({ schemes: ["ws:"] }).validate(u16)).toBe(u16);
		});
		test("Invalid URLs are invalid", () => {
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
		// test("Domain labels with up 63 characters are valid", () => {
		// 	expect(schema.validate("http://www.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijk.com/")).toBe(
		// 		"http://www.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijk.com/",
		// 	);
		// });
		// test("Domain labels longer than 63 characters are invalid", () => {
		// 	expect(() => schema.validate("http://www.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaax.com")).toThrow(Feedback);
		// });
		// test("Hostnames with 253 total characters are valid", () => {
		// 	const v =
		// 		"http://a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.com/";
		// 	expect(schema.validate(v)).toBe(v);
		// });
		// test("Hostnames with more than 253 total characters are invalid", () => {
		// 	const v =
		// 		"http://a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.x.com/";
		// 	expect(() => schema.validate(v)).toThrow(Feedback);
		// });
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
	describe("resource", () => {
		test("Valid resource is valid", () => {
			expect(schema.validate("http://x.com/a/b/c")).toBe("http://x.com/a/b/c");
			expect(schema.validate("http://x.com/a?a=a#a")).toBe("http://x.com/a?a=a#a");
		});
		test("Resource without hostname is valid for URIs (not URLs)", () => {
			const schema1 = new LinkSchema({ schemes: ["urn:"] });
			expect(schema1.validate("urn:193847738")).toBe("urn:193847738");
		});
	});
	describe("length", () => {
		test("URL shorter than 1024 chars is valid", () => {
			expect(schema.validate("http://x.com/a/b/c")).toBe("http://x.com/a/b/c");
		});
		test("URLs that are more than 1024 chars are invalid", () => {
			const chars1025 = "1".repeat(1025);
			const longUrl = `http://x.com/?long=${chars1025}`;
			expect(() => schema.validate(longUrl)).toThrow(Feedback);
		});
	});
});
describe("options.value", () => {
	test("Undefined default value is invalid", () => {
		const schema = LINK;
		expect(() => schema.validate(undefined)).toThrow(Feedback);
	});
	test("Undefined with default value returns default value", () => {
		const schema = new LinkSchema({ value: "http://x.com/" });
		expect(schema.validate(undefined)).toBe("http://x.com/");
	});
});
describe("options.schemes", () => {
	test("Scheme in default whitelist is allowed", () => {
		const schema = NULLABLE_LINK;
		expect(schema.validate("http://x.com/")).toBe("http://x.com/");
		expect(schema.validate("https://x.com/")).toBe("https://x.com/");
	});
	test("Scheme not in default whitelist is invalid", () => {
		const schema = NULLABLE_LINK;
		expect(() => schema.validate("webcal://x.com")).toThrow(Feedback);
	});
	test("Scheme in specified whitelist is valid", () => {
		const schema = new LinkSchema({ schemes: ["telnet:"] });
		expect(schema.validate("telnet://x.com")).toBe("telnet://x.com");
	});
	test("Scheme not in specified whitelist is invalid", () => {
		const schema = new LinkSchema({ schemes: ["telnet:"] });
		expect(() => schema.validate("webcal://x.com:")).toThrow(Feedback);
	});
});
describe("options.hosts", () => {
	test("Host in default whitelist is allowed", () => {
		const schema = new LinkSchema({ hosts: ["x.com"] });
		expect(schema.validate("http://x.com/")).toBe("http://x.com/");
		expect(schema.validate("https://x.com/")).toBe("https://x.com/");
	});
	test("Host not in specified whitelist is invalid", () => {
		const schema = new LinkSchema({ hosts: ["x.com"] });
		expect(() => schema.validate("http://y.com/")).toThrow(Feedback);
		expect(() => schema.validate("https://y.com/")).toThrow(Feedback);
	});
});
