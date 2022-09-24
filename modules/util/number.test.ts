import { formatNumber, roundStep, sumNumbers, getOptionalNumber, getRange, cramNumber, roundNumber, truncateNumber, boundNumber, wrapNumber, AssertionError } from "../index.js";

test("roundNumber(): Works correctly", () => {
	expect(roundNumber(123.456, 0)).toBe(123);
	expect(roundNumber(123.456, 1)).toBe(123.5);
	expect(roundNumber(123.456, 2)).toBe(123.46);
	expect(roundNumber(123.456, 3)).toBe(123.456);
});
test("boundNumber()", () => {
	expect(boundNumber(250, -100, 100)).toBe(100);
	expect(boundNumber(-250, -100, 100)).toBe(-100);

	// Min must be higher than max.
	expect(() => boundNumber(1, 100, 99)).toThrow(AssertionError);
});
test("wrapNumber()", () => {
	// Wrapping needed.
	expect(wrapNumber(-180, 0, 360)).toBe(180);
	expect(wrapNumber(-40, 0, 60)).toBe(20);
	expect(wrapNumber(100, 0, 60)).toBe(40);
	expect(wrapNumber(-40, 0, 60)).toBe(20);
	expect(wrapNumber(250, -100, 100)).toBe(50);
	expect(wrapNumber(-250, -100, 100)).toBe(-50);
	expect(wrapNumber(17, 3, 7)).toBe(5);
	expect(wrapNumber(-17, -7, -3)).toBe(-5);
	expect(wrapNumber(1, 3, 7)).toBe(5);

	// Max is the same as min.
	expect(wrapNumber(360, 0, 360)).toBe(0);

	// No wrapping needed.
	expect(wrapNumber(19, 0, 59)).toBe(19);

	// Min must be higher than max.
	expect(() => wrapNumber(1, 100, 99)).toThrow(AssertionError);
});
test("truncateNumber(): Works correctly", () => {
	expect(truncateNumber(123, 0)).toBe(123);
	expect(truncateNumber(123.4, 1)).toBe(123.4);
	expect(truncateNumber(123.45, 2)).toBe(123.45);
	expect(truncateNumber(123.456, 3)).toBe(123.456);
});
test("formatNumber(): Works correctly", () => {
	expect(formatNumber(123)).toBe("123");
	expect(formatNumber(1234)).toBe("1,234");
	expect(formatNumber(1234.0123456789)).toBe("1,234.0123456789");
	expect(formatNumber(1234.0123)).toBe("1,234.0123");
	expect(formatNumber(1234.000)).toBe("1,234"); // prettier-ignore
	expect(formatNumber(1234.0001, 4)).toBe("1,234.0001");
	expect(formatNumber(1234.0123456789, 3)).toBe("1,234.012");
	expect(formatNumber(1234.0123456789, 5)).toBe("1,234.01235");
	expect(formatNumber(1234.01234, 5)).toBe("1,234.01234");
});
test("cramNumber(): Works correctly", () => {
	// General.
	expect(cramNumber(0.01)).toBe("0.01");
	expect(cramNumber(0.1)).toBe("0.1");
	expect(cramNumber(1)).toBe("1");
	expect(cramNumber(10)).toBe("10");
	expect(cramNumber(100)).toBe("100");
	expect(cramNumber(1_000)).toBe("1000");
	expect(cramNumber(10_000)).toBe("10.0K");
	expect(cramNumber(100_000)).toBe("100K");
	expect(cramNumber(1_000_000)).toBe("1.00M");
	expect(cramNumber(10_000_000)).toBe("10.0M");
	expect(cramNumber(100_000_000)).toBe("100M");
	expect(cramNumber(1_000_000_000)).toBe("1.00B");
	expect(cramNumber(10_000_000_000)).toBe("10.0B");
	expect(cramNumber(100_000_000_000)).toBe("100B");
	expect(cramNumber(1_000_000_000_000)).toBe("1.00T");
	expect(cramNumber(10_000_000_000_000)).toBe("10.0T");
	expect(cramNumber(100_000_000_000_000)).toBe("100T");
	// Edge cases.
	expect(cramNumber(0.99)).toBe("0.99");
	expect(cramNumber(0.9)).toBe("0.9");
	expect(cramNumber(9)).toBe("9");
	expect(cramNumber(99)).toBe("99");
	expect(cramNumber(999)).toBe("999");
	expect(cramNumber(9_999)).toBe("9999");
	expect(cramNumber(99_999)).toBe("99.9K"); // Rounds down.
	expect(cramNumber(999_999)).toBe("999K"); // Rounds down.
	expect(cramNumber(9_999_999)).toBe("9.99M"); // Rounds down.
	expect(cramNumber(99_999_999)).toBe("99.9M"); // Rounds down.
	expect(cramNumber(999_999_999)).toBe("999M"); // Rounds down.
	expect(cramNumber(9_999_999_999)).toBe("9.99B"); // Rounds down.
	expect(cramNumber(99_999_999_999)).toBe("99.9B"); // Rounds down.
	expect(cramNumber(999_999_999_999)).toBe("999B"); // Rounds down.
	expect(cramNumber(9_999_999_999_999)).toBe("9.99T"); // Rounds down.
	expect(cramNumber(99_999_999_999_999)).toBe("99.9T"); // Rounds down.
	expect(cramNumber(999_999_999_999_999)).toBe("999T"); // Rounds down.
});
describe("roundStep()", () => {
	test("Numbers are rounded correctly without step", () => {
		expect(roundStep(51)).toBe(51);
		expect(roundStep(51.1)).toBe(51);
		expect(roundStep(51.5)).toBe(52);
	});
	test("Numbers are rounded correctly with step", () => {
		expect(roundStep(51, 100)).toBe(100);
		expect(roundStep(50, 100)).toBe(100); // Rounds up when exactly halfway.
		expect(roundStep(149, 100)).toBe(100);
		expect(roundStep(4, 2)).toBe(4);
		expect(roundStep(3, 2)).toBe(4); // Rounds up when exactly halfway.
		expect(roundStep(2, 2)).toBe(2);
		expect(roundStep(1001, 1)).toBe(1001);
		expect(roundStep(100.0, 1)).toBe(100);
		expect(roundStep(100.001, 0.001)).toBe(100.001);
		expect(roundStep(100.001, 0.001)).not.toBe(100);
		expect(roundStep(100.00001, 0.00001)).toBe(100.00001);
		expect(roundStep(100.00001, 0.0001)).toBe(100);
	});
});
describe("getOptionalNumber()", () => {
	test("Whole numbers are converted correctly", () => {
		expect(getOptionalNumber("0")).toBe(0);
		expect(getOptionalNumber("1")).toBe(1);
		expect(getOptionalNumber("0.")).toBe(0);
		expect(getOptionalNumber("1.")).toBe(1);
		expect(getOptionalNumber("0000.")).toBe(0);
		expect(getOptionalNumber("1000.")).toBe(1000);
		expect(getOptionalNumber("0001.")).toBe(1);
	});
	test("Decimal numbers are converted correctly", () => {
		expect(getOptionalNumber("1.1")).toBe(1.1);
		expect(getOptionalNumber("1.555")).toBe(1.555);
		expect(getOptionalNumber("123.456")).toBe(123.456);
	});
	test("Signs are converted correctly", () => {
		expect(getOptionalNumber("-1")).toBe(-1);
		expect(getOptionalNumber("-1.5")).toBe(-1.5);
	});
	test("Complicated numbers are fixed correctly", () => {
		expect(getOptionalNumber("99999.99999")).toBe(99999.99999);
		expect(getOptionalNumber("-99999.99999")).toBe(-99999.99999);
	});
	test("Empty string returns null", () => {
		expect(getOptionalNumber("")).toBe(null);
	});
	test("Non-numbers return null", () => {
		expect(getOptionalNumber(".")).toBe(null);
		expect(getOptionalNumber("a")).toBe(null);
		expect(getOptionalNumber("Willow perceptiveness purely sportsmanship namaste victoriously?")).toBe(null);
	});
});
test("sumNumbers()", () => {
	expect(sumNumbers([])).toBe(0);
	expect(sumNumbers([1, 2, 3, 4, 5, 6])).toBe(21);
	expect(sumNumbers(new Set([1, 2, 3, 4, 5]))).toBe(15);
	expect(sumNumbers(getRange(0, 0))).toBe(0);
	expect(sumNumbers(getRange(1, 1))).toBe(1);
	expect(sumNumbers(getRange(31, 29))).toBe(90);
});
