import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { NoticeCard } from "./NoticeCard.js";

describe("NoticeCard", () => {
	test("renders an aside with the status role and its content", () => {
		const html = renderToStaticMarkup(<NoticeCard status="success">All done</NoticeCard>);
		expect(html).toContain("<aside");
		expect(html).toContain('role="status"');
		expect(html).toContain("All done");
	});

	test("uses the alert role for error and danger statuses", () => {
		expect(renderToStaticMarkup(<NoticeCard status="error">Broke</NoticeCard>)).toContain('role="alert"');
		expect(renderToStaticMarkup(<NoticeCard status="danger">Careful</NoticeCard>)).toContain('role="alert"');
	});

	test("hides the icon when icon is false", () => {
		const html = renderToStaticMarkup(
			<NoticeCard status="info" icon={false}>
				No icon
			</NoticeCard>,
		);
		expect(html).not.toContain("<svg");
	});
});
