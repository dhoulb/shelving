import { Color, toColor, AssertionError, getColor } from "../index.js";
import { isDark, isLight } from "./color.js";

test("toColor(): colors", () => {
	expect(toColor("#fff")).toBeInstanceOf(Color);
	expect(toColor("#ffffff")).toBeInstanceOf(Color);
	expect(toColor("#ffffffff")).toBeInstanceOf(Color);
	expect(toColor("fff")).toBeInstanceOf(Color); // Can skip `#` hash.
	expect(toColor("ffffff")).toBeInstanceOf(Color); // Can skip `#` hash.
	expect(toColor("ffffffff")).toBeInstanceOf(Color); // Can skip `#` hash.
});
test("toColor(): non-colors", () => {
	expect(toColor("#f")).toEqual(null);
	expect(toColor("#ff")).toEqual(null);
	expect(toColor("#ffff")).toEqual(null);
	expect(toColor("#fffff")).toEqual(null);
	expect(toColor("#GGG")).toEqual(null);
	expect(toColor("#GGGGGG")).toEqual(null);
});
test("getColor(): works correctly", () => {
	expect(getColor("#00ccff")).toBeInstanceOf(Color);
	expect(() => getColor("nope")).toThrow(AssertionError);
});
test("Color: conversion", () => {
	expect(getColor("#00ccff").hex).toEqual("#00ccff");
	expect(getColor("#00ccff").rgb).toEqual("rgb(0, 204, 255)");
	expect(getColor("#00ccff80").rgba).toEqual("rgba(0, 204, 255, 0.5)");
	expect(getColor("#00ccff").luminance).toEqual(164);
});
test("isLight() and isDark()", () => {
	expect(isLight("#000000")).toBe(false);
	expect(isDark("#000000")).toBe(true);
	expect(isLight("#FFFFFF")).toBe(true);
	expect(isDark("#FFFFFF")).toBe(false);
	expect(isLight("#00ccff")).toBe(true);
	expect(isDark("#00ccff")).toBe(false);
});
