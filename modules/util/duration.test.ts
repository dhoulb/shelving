import { describe, expect, test } from "bun:test";
import { DAY, HOUR, MINUTE, MONTH, SECOND, WEEK } from "./constants.js";
import { getBestTimeUnit, getMillisecondsUntil } from "./duration.js";

test("getMillisecondsUntil()", () => {
	expect(getMillisecondsUntil(10000000, 20000000)).toBe(-10000000);
});

describe("getBestTimeUnit()", () => {
	test("uses the expected unit at exact thresholds", () => {
		expect(getBestTimeUnit(SECOND).key).toBe("second");
		expect(getBestTimeUnit(MINUTE).key).toBe("minute");
		expect(getBestTimeUnit(HOUR).key).toBe("hour");
		expect(getBestTimeUnit(DAY).key).toBe("day");
		expect(getBestTimeUnit(10 * DAY).key).toBe("week");
		expect(getBestTimeUnit(10 * WEEK).key).toBe("month");
		expect(getBestTimeUnit(18 * MONTH).key).toBe("year");
	});

	test("uses the smaller unit just below each threshold", () => {
		expect(getBestTimeUnit(SECOND - 1).key).toBe("millisecond");
		expect(getBestTimeUnit(MINUTE - 1).key).toBe("second");
		expect(getBestTimeUnit(HOUR - 1).key).toBe("minute");
		expect(getBestTimeUnit(DAY - 1).key).toBe("hour");
		expect(getBestTimeUnit(10 * DAY - 1).key).toBe("day");
		expect(getBestTimeUnit(10 * WEEK - 1).key).toBe("week");
		expect(getBestTimeUnit(18 * MONTH - 1).key).toBe("month");
	});

	test("is symmetric for past and future durations", () => {
		expect(getBestTimeUnit(2 * HOUR).key).toBe("hour");
		expect(getBestTimeUnit(-2 * HOUR).key).toBe("hour");
		expect(getBestTimeUnit(17 * MONTH).key).toBe("month");
		expect(getBestTimeUnit(-17 * MONTH).key).toBe("month");
	});
});
