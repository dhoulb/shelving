import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Field } from "./Field.js";

describe("Field", () => {
	test("does not render a message container when there is no message", () => {
		const html = renderToStaticMarkup(
			<Field title="Email">
				<input type="email" />
			</Field>,
		);

		expect(html).not.toContain('role="alert"');
	});

	test("renders a message container when a message is present", () => {
		const html = renderToStaticMarkup(
			<Field title="Email" message="Required">
				<input type="email" />
			</Field>,
		);

		expect(html).toContain('role="alert"');
		expect(html).toContain("Required");
	});
});
