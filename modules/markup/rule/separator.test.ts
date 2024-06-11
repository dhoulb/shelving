import { expect, test } from "bun:test";
import { MARKUP_RULES, renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.element");
const OPTIONS = {
	rules: MARKUP_RULES,
};

test("BREAK", () => {
	expect(renderMarkup("***", OPTIONS)).toMatchObject({ $$typeof, type: "hr", props: {} });
	expect(renderMarkup("---", OPTIONS)).toMatchObject({ $$typeof, type: "hr", props: {} });
	expect(renderMarkup("+++", OPTIONS)).toMatchObject({ $$typeof, type: "hr", props: {} });
	expect(renderMarkup("•••", OPTIONS)).toMatchObject({ $$typeof, type: "hr", props: {} });
	expect(renderMarkup("* * *", OPTIONS)).toMatchObject({ $$typeof, type: "hr", props: {} });
	expect(renderMarkup("- - -", OPTIONS)).toMatchObject({ $$typeof, type: "hr", props: {} });
	expect(renderMarkup("+ + +", OPTIONS)).toMatchObject({ $$typeof, type: "hr", props: {} });
	expect(renderMarkup("• • •", OPTIONS)).toMatchObject({ $$typeof, type: "hr", props: {} });
});
