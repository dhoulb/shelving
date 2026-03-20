import { describe, expect, test } from "bun:test";
import { RequiredError } from "../error/RequiredError.js";
import { getMessage, joinMessage, requireMessage, splitMessage } from "./error.js";

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
		expect(splitMessage("1: name: value")).toEqual({ "1": "name: value" });
		expect(splitMessage(splitMessage("1: name: value")["1"]!)).toEqual({ name: "value" });
		expect(splitMessage("1: name: value\n1: email: value")).toEqual({
			"1": "name: value\nemail: value",
		});
		expect(splitMessage("1: name: value\n2: address: value\n1: email: value")).toEqual({
			"1": "name: value\nemail: value",
			"2": "address: value",
		});
	});
	test("empty lines are skipped", () => {
		expect(splitMessage("1: name: value\n")).toEqual({ "1": "name: value" });
		expect(splitMessage("\n1: name: value")).toEqual({ "1": "name: value" });
		expect(splitMessage(splitMessage("1: name: value")["1"]!)).toEqual({ name: "value" });
		expect(splitMessage("name: value\n\n\nemail: value")).toEqual({ name: "value", email: "value" });
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
describe("joinMessages()", () => {
	test("joins unnamed messages", () => {
		expect(joinMessage({ "": "one\ntwo" })).toBe("one\ntwo");
	});
	test("joins named messages", () => {
		expect(joinMessage({ name: "value", email: "a\nb" })).toBe("name: value\nemail: a\nemail: b");
	});
	test("joins mixed messages in object order", () => {
		expect(joinMessage({ title: "First\nSecond", "": "plain", author: "Jane" })).toBe("title: First\ntitle: Second\nplain\nauthor: Jane");
	});
	test("normalizes whitespace and skips empty lines", () => {
		expect(joinMessage({ name: " value \n\n another ", "": "  plain  \n  " })).toBe("name: value\nname: another\nplain");
	});
	test("round trips with splitMessage()", () => {
		const input = {
			title: "First title\nSecond title",
			author: "Jane",
			"": "Some unnamed info\nAnother unnamed line",
		};
		expect(splitMessage(joinMessage(input))).toEqual(input);
	});
});
