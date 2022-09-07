import { Color, getOptionalColor, AssertionError, getColor, isDark, isLight } from "../index.js";

test("toColor(): colors", () => {
	expect(getOptionalColor("#fff")).toBeInstanceOf(Color);
	expect(getOptionalColor("#ffffff")).toBeInstanceOf(Color);
	expect(getOptionalColor("#ffffffff")).toBeInstanceOf(Color);
	expect(getOptionalColor("fff")).toBeInstanceOf(Color); // Can skip `#` hash.
	expect(getOptionalColor("ffffff")).toBeInstanceOf(Color); // Can skip `#` hash.
	expect(getOptionalColor("ffffffff")).toBeInstanceOf(Color); // Can skip `#` hash.
});
test("toColor(): non-colors", () => {
	expect(getOptionalColor("#f")).toEqual(null);
	expect(getOptionalColor("#ff")).toEqual(null);
	expect(getOptionalColor("#ffff")).toEqual(null);
	expect(getOptionalColor("#fffff")).toEqual(null);
	expect(getOptionalColor("#GGG")).toEqual(null);
	expect(getOptionalColor("#GGGGGG")).toEqual(null);
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
