import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { EMPTY_LOADING, Empty, Paragraph } from "shelving/ui";

describe("Empty", () => {
	test("renders its children in one block", () => {
		const html = renderToStaticMarkup(
			<Empty>
				<Paragraph>No items yet.</Paragraph>
			</Empty>,
		);
		expect(html).toMatch(/^<div[^>]*><p[^>]*>No items yet\.<\/p><\/div>$/);
	});
	test("EMPTY_LOADING renders a spinner in the same block", () => {
		const html = renderToStaticMarkup(EMPTY_LOADING);
		expect(html).toMatch(/^<div[^>]*><svg[^>]*>.*<\/svg><\/div>$/);
	});
});
