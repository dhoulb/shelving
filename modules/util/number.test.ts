import { formatNumber, roundStep, toNumber } from "../index.js";

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
describe("toNumber()", () => {
	test("Whole numbers are converted correctly", () => {
		expect(toNumber("0")).toBe(0);
		expect(toNumber("1")).toBe(1);
		expect(toNumber("0.")).toBe(0);
		expect(toNumber("1.")).toBe(1);
		expect(toNumber("0000.")).toBe(0);
		expect(toNumber("1000.")).toBe(1000);
		expect(toNumber("0001.")).toBe(1);
	});
	test("Decimal numbers are converted correctly", () => {
		expect(toNumber("1.1")).toBe(1.1);
		expect(toNumber("1.555")).toBe(1.555);
		expect(toNumber("123.456")).toBe(123.456);
	});
	test("Signs are converted correctly", () => {
		expect(toNumber("-1")).toBe(-1);
		expect(toNumber("-1.5")).toBe(-1.5);
	});
	test("Complicated numbers are fixed correctly", () => {
		expect(toNumber("99999.99999")).toBe(99999.99999);
		expect(toNumber("-99999.99999")).toBe(-99999.99999);
	});
	test("Empty string returns null", () => {
		expect(toNumber("")).toBe(null);
	});
	test("Non-numbers return null", () => {
		expect(toNumber(".")).toBe(null);
		expect(toNumber("a")).toBe(null);
		expect(toNumber("Willow perceptiveness purely sportsmanship namaste victoriously?")).toBe(null);
	});
});
