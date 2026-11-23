import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { App, Link } from "shelving/ui";

describe("Link", () => {
	test("marks a link to the current page as the current page", () => {
		const html = renderToStaticMarkup(
			<App url="https://x.com/abc">
				<Link href="/abc">ABC</Link>
			</App>,
		);
		expect(html).toContain('aria-current="page"');
	});
	test("renders a mailto: link", () => {
		const html = renderToStaticMarkup(
			<App url="https://x.com/abc">
				<Link href="mailto:hello@x.com">hello@x.com</Link>
			</App>,
		);
		expect(html).toContain('href="mailto:hello@x.com"');
		expect(html).not.toContain("aria-current");
	});
});
