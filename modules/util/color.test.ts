import { expect, test } from "bun:test";
import { Color, getColor, RequiredError, requireColor } from "../index.js";

test("toColor(): colors", () => {
	expect(getColor("#fff")).toBeInstanceOf(Color);
	expect(getColor("#ffffff")).toBeInstanceOf(Color);
	expect(getColor("#ffffffff")).toBeInstanceOf(Color);
	expect(getColor("fff")).toBeInstanceOf(Color); // Can skip `#` hash.
	expect(getColor("ffffff")).toBeInstanceOf(Color); // Can skip `#` hash.
	expect(getColor("ffffffff")).toBeInstanceOf(Color); // Can skip `#` hash.
});
test("toColor(): non-colors", () => {
	expect<Color | undefined>(getColor("#f")).toBe(undefined);
	expect<Color | undefined>(getColor("#ff")).toBe(undefined);
	expect<Color | undefined>(getColor("#ffff")).toBe(undefined);
	expect<Color | undefined>(getColor("#fffff")).toBe(undefined);
	expect<Color | undefined>(getColor("#GGG")).toBe(undefined);
	expect<Color | undefined>(getColor("#GGGGGG")).toBe(undefined);
});
test("getColor(): works correctly", () => {
	expect(requireColor("#00ccff")).toBeInstanceOf(Color);
	expect(() => requireColor("nope")).toThrow(RequiredError);
});
test("Color: conversion", () => {
	expect(requireColor("#00ccff").hex).toEqual("#00ccff");
	expect(requireColor("#00ccff").rgb).toEqual("rgb(0, 204, 255)");
	expect(requireColor("#00ccff80").rgba).toEqual("rgba(0, 204, 255, 0.5)");
	expect(requireColor("#00ccff").luminance).toEqual(164);
});
test(".isLight and .isDark", () => {
	expect(requireColor("#000000").isLight).toBe(false);
	expect(requireColor("#000000").isDark).toBe(true);
	expect(requireColor("#FFFFFF").isLight).toBe(true);
	expect(requireColor("#FFFFFF").isDark).toBe(false);
	expect(requireColor("#00ccff").isLight).toBe(true);
	expect(requireColor("#00ccff").isDark).toBe(false);
});
