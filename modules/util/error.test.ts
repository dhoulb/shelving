import { describe, expect, test } from "bun:test";
import { RequiredError } from "../error/RequiredError.js";
import { getMessage, requireMessage, splitMessage } from "./error.js";

describe("getMessage()", () => {
	test("returns string when input is string", () => {
		expect(getMessage("hello"))?.toBe("hello");
	});
	test("returns message from object with message", () => {
		expect(getMessage({ message: "world" }))?.toBe("world");
	});
	test("returns undefined for object without message", () => {
		expect(getMessage({})).toBeUndefined();
	});
	test("returns undefined for non-object non-string", () => {
		expect(getMessage(123)).toBeUndefined();
	});
});
describe("requireMessage()", () => {
	test("returns provided string", () => {
		expect(requireMessage("alpha")).toBe("alpha");
	});
	test("returns message from object", () => {
		expect(requireMessage({ message: "beta" })).toBe("beta");
	});
	test("throws RequiredError when missing", () => {
		expect(() => requireMessage({} as any)).toThrow(RequiredError);
	});
});
describe("splitMessage()", () => {
	test("single unnamed line", () => {
		expect(splitMessage("Just one line"))?.toEqual({ "": "Just one line" });
	});
	test("named line", () => {
		expect(splitMessage("name: value"))?.toEqual({ name: "value" });
	});
	test("multiple mixed lines", () => {
		const input = ["title: First title", "Some unnamed info", "author: Jane", "title: Second title", "Another unnamed line"].join("\n");
		expect(splitMessage(input)).toEqual({
			title: "First title\nSecond title",
			author: "Jane",
			"": "Some unnamed info\nAnother unnamed line",
		});
	});
	test("named line with multiple prefixes", () => {
		expect(splitMessage("1: name: value"))?.toEqual({ "1": "name: value" });
		expect(splitMessage(splitMessage("1: name: value")["1"]!))?.toEqual({ name: "value" });
	});
	test("lines with extra whitespace are trimmed", () => {
		const input = " name : value with spaces \n  plain line  ";
		// Because pattern requires ': ' exactly, first line indexOf(": ") finds the one after trimmed name
		// Our code trims name and message separately
		expect(splitMessage(input)).toEqual({ name: "value with spaces", "": "plain line" });
	});
	test("colon without space is treated as unnamed", () => {
		expect(splitMessage("foo:bar"))?.toEqual({ "": "foo:bar" });
	});
	test("repeated named lines aggregate with newline", () => {
		const input = "k: one\nk: two\nk: three";
		expect(splitMessage(input)).toEqual({ k: "one\ntwo\nthree" });
	});
});
