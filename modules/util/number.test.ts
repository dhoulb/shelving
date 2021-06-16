import { formatNumber, roundNumber, stringToNumber } from "..";

test("formatNumber(): Works correctly", () => {
	expect(formatNumber(123)).toBe("123");
	expect(formatNumber(1234)).toBe("1,234");
	expect(formatNumber(1234.0123456789)).toBe("1,234.0123456789");
	expect(formatNumber(1234.0123)).toBe("1,234.0123");
	expect(formatNumber(1234.000)).toBe("1,234"); // prettier-ignore
	expect(formatNumber(1234.0001)).toBe("1,234.0001");
	expect(formatNumber(1234.0123456789, 3)).toBe("1,234.012");
	expect(formatNumber(1234.01234, 5)).toBe("1,234.01234");
});
describe("roundNumber()", () => {
	test("Numbers are rounded correctly without step", () => {
		expect(roundNumber(51)).toBe(51);
		expect(roundNumber(51.1)).toBe(51);
		expect(roundNumber(51.5)).toBe(52);
	});
	test("Numbers are rounded correctly with step", () => {
		expect(roundNumber(51, 100)).toBe(100);
		expect(roundNumber(50, 100)).toBe(100); // Rounds up when exactly halfway.
		expect(roundNumber(149, 100)).toBe(100);
		expect(roundNumber(4, 2)).toBe(4);
		expect(roundNumber(3, 2)).toBe(4); // Rounds up when exactly halfway.
		expect(roundNumber(2, 2)).toBe(2);
		expect(roundNumber(1001, 1)).toBe(1001);
		expect(roundNumber(100.0, 1)).toBe(100);
		expect(roundNumber(100.001, 0.001)).toBe(100.001);
		expect(roundNumber(100.001, 0.001)).not.toBe(100);
		expect(roundNumber(100.00001, 0.00001)).toBe(100.00001);
		expect(roundNumber(100.00001, 0.0001)).toBe(100);
	});
});
describe("stringToNumber()", () => {
	test("Whole numbers are converted correctly", () => {
		expect(stringToNumber("0")).toBe(0);
		expect(stringToNumber("1")).toBe(1);
		expect(stringToNumber("0.")).toBe(0);
		expect(stringToNumber("1.")).toBe(1);
		expect(stringToNumber("0000.")).toBe(0);
		expect(stringToNumber("1000.")).toBe(1000);
		expect(stringToNumber("0001.")).toBe(1);
	});
	test("Decimal numbers are converted correctly", () => {
		expect(stringToNumber("1.1")).toBe(1.1);
		expect(stringToNumber("1.555")).toBe(1.555);
		expect(stringToNumber("123.456")).toBe(123.456);
		expect(stringToNumber("1.5.5.5")).toBe(1.555);
		expect(stringToNumber("99999.9.9.9.9.9")).toBe(99999.99999);
		expect(stringToNumber(".0")).toBe(0);
		expect(stringToNumber(".1")).toBe(0.1);
		expect(stringToNumber(".0000")).toBe(0);
		expect(stringToNumber(".1000")).toBe(0.1);
		expect(stringToNumber(".0001")).toBe(0.0001);
	});
	test("Signs are converted correctly", () => {
		expect(stringToNumber("-1")).toBe(-1);
		expect(stringToNumber("--1")).toBe(1);
		expect(stringToNumber("---1")).toBe(-1);
		expect(stringToNumber("----1")).toBe(1);
		expect(stringToNumber("+1")).toBe(1);
		expect(stringToNumber("++1")).toBe(1);
		expect(stringToNumber("+++1")).toBe(1);
		expect(stringToNumber("++++1")).toBe(1);
		expect(stringToNumber("+-+1")).toBe(-1);
		expect(stringToNumber("-+-+1")).toBe(1);
		expect(stringToNumber("1.5")).toBe(1.5);
		expect(stringToNumber("-1.5")).toBe(-1.5);
		expect(stringToNumber("--1.5")).toBe(1.5);
		expect(stringToNumber("---1.5")).toBe(-1.5);
		expect(stringToNumber("----1.5")).toBe(1.5);
	});
	test("Complicated numbers are fixed correctly", () => {
		expect(stringToNumber("99999.9.9.9.9.9")).toBe(99999.99999);
		expect(stringToNumber("-99999.9.9.9.9.9")).toBe(-99999.99999);
		expect(stringToNumber("--99999.9.9.9.9.9")).toBe(99999.99999);
		expect(stringToNumber("---99999.9.9.9.9.9")).toBe(-99999.99999);
	});
	test("Empty string returns null", () => {
		expect(stringToNumber("")).toBe(null);
	});
	test("Non-numbers return null", () => {
		expect(stringToNumber(".")).toBe(null);
		expect(stringToNumber("a")).toBe(null);
		expect(stringToNumber("Willow perceptiveness purely sportsmanship namaste victoriously?")).toBe(null);
	});
});
