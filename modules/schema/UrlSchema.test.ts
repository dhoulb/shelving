import { InvalidFeedback, UrlSchema } from "../index.js";

// Tests.
describe("UrlSchema", () => {
	test("TypeScript", () => {
		// Test url.optional
		const s1: UrlSchema = UrlSchema.OPTIONAL;
		const r1: string = s1.validate("https://test.com");

		// Test url.required
		const s2: UrlSchema = UrlSchema.REQUIRED;
		const r2: string = s2.validate("https://test.com");

		// Test schema.url({})
		const s3: UrlSchema = UrlSchema.create({});
		const r3: string = s3.validate("https://test.com");
		const s4: UrlSchema = UrlSchema.create({ required: true });
		const r4: string = s4.validate("https://test.com");
		const s5: UrlSchema = UrlSchema.create({ required: false });
		const r5: string = s5.validate("https://test.com");
		const s6: UrlSchema = UrlSchema.create({});
		const r6: string = s6.validate("https://test.com");
	});
	test("Constructs correctly", () => {
		const schema1 = UrlSchema.create({});
		expect(schema1).toBeInstanceOf(UrlSchema);
		expect(schema1.required).toBe(false);
		const schema2 = UrlSchema.REQUIRED;
		expect(schema2).toBeInstanceOf(UrlSchema);
		expect(schema2.required).toBe(true);
		const schema3 = UrlSchema.REQUIRED;
		expect(schema3).toBeInstanceOf(UrlSchema);
		expect(schema3.required).toBe(true);
	});
	describe("validate()", () => {
		const schema = UrlSchema.OPTIONAL;
		describe("URLs", () => {
			test("Valid URLs are valid.", () => {
				const u1 = "data:image/svg+xml;base64,SGVsbG8gd29ybGQ=";
				expect(UrlSchema.create({ schemes: ["data:"] }).validate(u1)).toBe(u1);
				const u2 = "feed:https://example.com/entries.atom"; // Weirdly feed can be either.
				expect(UrlSchema.create({ schemes: ["feed:"] }).validate(u2)).toBe(u2);
				const u3 = "feed://example.com/entries.atom"; // Weirdly feed can be either.
				expect(UrlSchema.create({ schemes: ["feed:"] }).validate(u3)).toBe(u3);
				const u4 = "file:///etc/fstab";
				expect(UrlSchema.create({ schemes: ["file:"] }).validate(u4)).toBe(u4);
				const u5 = "ftp://ftp.funet.fi/pub/standards/RFC/rfc959.txt";
				expect(UrlSchema.create({ schemes: ["ftp:"] }).validate(u5)).toBe(u5);
				const u6 = "geo:37.786971;-122.399677";
				expect(UrlSchema.create({ schemes: ["geo:"] }).validate(u6)).toBe(u6);
				const u7 = "https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Technical_overview";
				expect(UrlSchema.create({ schemes: ["https:"] }).validate(u7)).toBe(u7);
				const u8 =
					"http://www.google.ps/search?hl=en&client=firefox-a&hs=42F&rls=org.mozilla%3Aen-US%3Aofficial&q=The+type+%27Microsoft.Practices.ObjectBuilder.Locator%27+is+defined+in+an+assembly+that+is+not+referenced.+You+must+add+a+reference+to+assembly+&aq=f&aqi=&aql=&oq=";
				expect(UrlSchema.create({ schemes: ["http:"] }).validate(u8)).toBe(u8);
				const u9 = "irc://irc.efnet.org:6667/DiscworldMUD";
				expect(UrlSchema.create({ schemes: ["irc:"] }).validate(u9)).toBe(u9);
				const u10 = "mailto:dave@shax.com";
				expect(UrlSchema.create({ schemes: ["mailto:"] }).validate(u10)).toBe(u10);
				const u11 = "magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a&dn";
				expect(UrlSchema.create({ schemes: ["magnet:"] }).validate(u11)).toBe(u11);
				const u12 = "tel:+44123456789";
				expect(UrlSchema.create({ schemes: ["tel:"] }).validate(u12)).toBe(u12);
				const u13 = "telnet://rainmaker.wunderground.com";
				expect(UrlSchema.create({ schemes: ["telnet:"] }).validate(u13)).toBe(u13);
				const u14 = "urn:isbn:0-486-27557-4";
				expect(UrlSchema.create({ schemes: ["urn:"] }).validate(u14)).toBe(u14);
				const u15 = "webcal://espn.go.com/travel/sports/calendar/export/espnCal?teams=6_23";
				expect(UrlSchema.create({ schemes: ["webcal:"] }).validate(u15)).toBe(u15);
				const u16 = "ws://localhost:8080/websocket/wsserver";
				expect(UrlSchema.create({ schemes: ["ws:"] }).validate(u16)).toBe(u16);
			});
			test("Falsy values return empty string", () => {
				expect(schema.validate("")).toBe("");
				expect(schema.validate(null)).toBe("");
				expect(schema.validate(undefined)).toBe("");
				expect(schema.validate(false)).toBe("");
			});
			test("Invalid URLs are Invalid", () => {
				expect(() => schema.validate("user@")).toThrow(InvalidFeedback);
				expect(() => schema.validate(":port")).toThrow(InvalidFeedback);
			});
			test("Non-strings are Invalid", () => {
				expect(() => schema.validate([])).toThrow(InvalidFeedback);
				expect(() => schema.validate({})).toThrow(InvalidFeedback);
				expect(() => schema.validate(true)).toThrow(InvalidFeedback);
			});
		});
		describe("scheme", () => {
			test("Valid scheme is valid", () => {
				expect(schema.validate("http://x.com/")).toBe("http://x.com/");
				expect(schema.validate("https://x.com/")).toBe("https://x.com/");
			});
			test("Invalid scheme is invalid", () => {
				expect(() => schema.validate("data:x.com")).toThrow(InvalidFeedback);
				expect(() => schema.validate("$$$://x.com")).toThrow(InvalidFeedback);
			});
			test("Scheme is lowercased", () => {
				expect(schema.validate("HTTP://x.com/")).toBe("http://x.com/");
			});
			test("Default scheme is added if missing", () => {
				expect(schema.validate("x.com")).toBe("http://x.com/");
				expect(schema.validate("//x.com")).toBe("http://x.com/");
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
			test("Domain labels with up 63 characters are valid", () => {
				expect(schema.validate("http://www.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijk.com/")).toBe(
					"http://www.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijk.com/",
				);
			});
			test("Domain labels longer than 63 characters are invalid", () => {
				expect(() => schema.validate("http://www.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaax.com")).toThrow(InvalidFeedback);
			});
			test("Hostnames with 253 total characters are valid", () => {
				const v =
					"http://a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.com/";
				expect(schema.validate(v)).toBe(v);
			});
			test("Hostnames with more than 253 total characters are invalid", () => {
				const v =
					"http://a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.x.com/";
				expect(() => schema.validate(v)).toThrow(InvalidFeedback);
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
				expect(() => schema.validate("http://x.com:-20000/")).toThrow(InvalidFeedback);
			});
			test("Ports higher than 65,535 are invalid", () => {
				expect(() => schema.validate("http://x.com:65536")).toThrow(InvalidFeedback);
				expect(() => schema.validate("http://x.com:283999482")).toThrow(InvalidFeedback);
			});
			test("Ports that are non-numeric are invalid", () => {
				expect(() => schema.validate("http://x.com:abc")).toThrow(InvalidFeedback);
			});
		});
		describe("resource", () => {
			test("Valid resource is valid", () => {
				expect(schema.validate("http://x.com/a/b/c")).toBe("http://x.com/a/b/c");
				expect(schema.validate("http://x.com/a?a=a#a")).toBe("http://x.com/a?a=a#a");
			});
			test("Resource without hostname is valid for URIs (not URLs)", () => {
				const schema1 = UrlSchema.create({ schemes: ["urn:"] });
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
				expect(() => schema.validate(longUrl)).toThrow(InvalidFeedback);
			});
		});
	});
	describe("options.value", () => {
		test("Undefined returns default value (empty string)", () => {
			const schema = UrlSchema.OPTIONAL;
			expect(schema.validate(undefined)).toBe("");
		});
		test("Undefined with default value returns default value", () => {
			const schema = UrlSchema.create({ value: "http://x.com/" });
			expect(schema.validate(undefined)).toBe("http://x.com/");
		});
	});
	describe("options.required", () => {
		test("Non-required value allows empty string", () => {
			const schema = UrlSchema.create({ required: false });
			expect(schema.validate(null)).toBe("");
			expect(schema.validate("")).toBe("");
			expect(schema.validate(false)).toBe("");
		});
		test("Required value disallows falsy", () => {
			const schema = UrlSchema.create({ required: true });
			expect(() => schema.validate(null)).toThrow(InvalidFeedback);
			expect(() => schema.validate("")).toThrow(InvalidFeedback);
			expect(() => schema.validate(false)).toThrow(InvalidFeedback);
		});
	});
	describe("options.schemes", () => {
		test("Scheme in default whitelist is allowed", () => {
			const schema = UrlSchema.OPTIONAL;
			expect(schema.validate("http://x.com/")).toBe("http://x.com/");
			expect(schema.validate("https://x.com/")).toBe("https://x.com/");
		});
		test("Scheme not in default whitelist is invalid", () => {
			const schema = UrlSchema.OPTIONAL;
			expect(() => schema.validate("webcal://x.com")).toThrow(InvalidFeedback);
		});
		test("Scheme in specified whitelist is valid", () => {
			const schema = UrlSchema.create({ schemes: ["telnet:"] });
			expect(schema.validate("telnet://x.com")).toBe("telnet://x.com");
		});
		test("Scheme not in specified whitelist is invalid", () => {
			const schema = UrlSchema.create({ schemes: ["telnet:"] });
			expect(() => schema.validate("webcal://x.com:")).toThrow(InvalidFeedback);
		});
	});
	describe("options.hosts", () => {
		test("Host in default whitelist is allowed", () => {
			const schema = UrlSchema.create({ hosts: ["x.com"] });
			expect(schema.validate("http://x.com/")).toBe("http://x.com/");
			expect(schema.validate("https://x.com/")).toBe("https://x.com/");
		});
		test("Host not in specified whitelist is invalid", () => {
			const schema = UrlSchema.create({ hosts: ["x.com"] });
			expect(() => schema.validate("http://y.com/")).toThrow(InvalidFeedback);
			expect(() => schema.validate("https://y.com/")).toThrow(InvalidFeedback);
		});
	});
	describe("options.validator", () => {
		test("Works correctly", () => {
			const feedback = new InvalidFeedback("WORKS");
			const schema = UrlSchema.create({
				validator: () => {
					throw feedback;
				},
			});
			try {
				schema.validate("a");
				expect(false).toBe(true);
			} catch (thrown) {
				expect(thrown).toBe(feedback);
			}
		});
	});
});
