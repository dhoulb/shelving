import { describe, expect, test } from "bun:test";
import { DAY, HOUR, MINUTE, MONTH, SECOND, WEEK } from "./constants.js";
import { getBestDurationUnit, getMillisecondsUntil } from "./duration.js";

test("getMillisecondsUntil()", () => {
	expect(getMillisecondsUntil(10000000, 20000000)).toBe(-10000000);
});

describe("getBestTimeUnit()", () => {
	test("uses the expected unit at exact thresholds", () => {
		expect(getBestDurationUnit(SECOND).key).toBe("second");
		expect(getBestDurationUnit(MINUTE).key).toBe("minute");
		expect(getBestDurationUnit(HOUR).key).toBe("hour");
		expect(getBestDurationUnit(DAY).key).toBe("day");
		expect(getBestDurationUnit(10 * DAY).key).toBe("week");
		expect(getBestDurationUnit(10 * WEEK).key).toBe("month");
		expect(getBestDurationUnit(18 * MONTH).key).toBe("year");
	});

	test("uses the smaller unit just below each threshold", () => {
		expect(getBestDurationUnit(SECOND - 1).key).toBe("millisecond");
		expect(getBestDurationUnit(MINUTE - 1).key).toBe("second");
		expect(getBestDurationUnit(HOUR - 1).key).toBe("minute");
		expect(getBestDurationUnit(DAY - 1).key).toBe("hour");
		expect(getBestDurationUnit(10 * DAY - 1).key).toBe("day");
		expect(getBestDurationUnit(10 * WEEK - 1).key).toBe("week");
		expect(getBestDurationUnit(18 * MONTH - 1).key).toBe("month");
	});

	test("is symmetric for past and future durations", () => {
		expect(getBestDurationUnit(2 * HOUR).key).toBe("hour");
		expect(getBestDurationUnit(-2 * HOUR).key).toBe("hour");
		expect(getBestDurationUnit(17 * MONTH).key).toBe("month");
		expect(getBestDurationUnit(-17 * MONTH).key).toBe("month");
	});
});
