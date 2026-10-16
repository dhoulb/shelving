import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Ago, When } from "shelving/ui";
import { HOUR, MINUTE, SECOND } from "shelving/util/constants";

describe("Ago", () => {
	test("shows narrow units by default", () => {
		expect(renderToStaticMarkup(<Ago target={0} current={HOUR * 3} />)).toContain(">3h<");
	});
	test("takes format options", () => {
		expect(renderToStaticMarkup(<Ago target={0} current={HOUR * 3} options={{ unitDisplay: "short" }} />)).toContain(">3 hr<");
	});
	test("shows just now under a minute", () => {
		expect(renderToStaticMarkup(<Ago target={0} current={SECOND * 5} />)).toContain(">just now<");
	});
});

describe("When", () => {
	test("takes format options", () => {
		expect(renderToStaticMarkup(<When target={0} current={MINUTE * 3} options={{ unitDisplay: "long" }} />)).toContain(">3 minutes ago<");
	});
});
