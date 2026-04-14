import { describe, expect, test } from "bun:test";
import { escapeXML, getXML, RequiredError } from "../index.js";

describe("escapeXML()", () => {
	test("escapes special XML characters", () => {
		expect(escapeXML(`<tag attr="x">&'y'</tag>`)).toBe("&lt;tag attr=&quot;x&quot;&gt;&amp;&apos;y&apos;&lt;/tag&gt;");
	});
});

describe("getXML()", () => {
	test("serializes nested data objects", () => {
		expect(getXML({ user: { name: "Alice", age: 30, active: true } })).toBe(
			"<user><name>Alice</name><age>30</age><active>true</active></user>",
		);
	});

	test("omits undefined values", () => {
		expect(getXML({ user: { name: "Alice", nickname: undefined } })).toBe("<user><name>Alice</name></user>");
	});

	test("escapes string values", () => {
		expect(getXML({ user: { name: `Tom & "Jerry"` } })).toBe("<user><name>Tom &amp; &quot;Jerry&quot;</name></user>");
	});

	test("throws for invalid XML keys", () => {
		expect(() => getXML({ "not-valid!": "x" })).toThrow(RequiredError);
	});

	test("throws for unsupported XML values", () => {
		expect(() => getXML({ user: ["Alice"] as never })).toThrow(RequiredError);
	});
});
