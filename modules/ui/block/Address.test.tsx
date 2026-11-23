import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { App, EmailAddress, PhysicalAddress } from "shelving/ui";

describe("EmailAddress", () => {
	test("renders the email as a link", () => {
		const html = renderToStaticMarkup(
			<App url="https://x.com/">
				<EmailAddress name="Acme" email="hi@x.com" />
			</App>,
		);
		expect(html).toMatch(/^<address[^>]*><strong[^>]*>Acme<\/strong>\n<a[^>]*href="mailto:hi@x\.com"[^>]*>hi@x\.com<\/a><\/address>$/);
	});
	test("takes block variants and a class", () => {
		const html = renderToStaticMarkup(<EmailAddress email="" size="xlarge" weight="strong" className="extra" />);
		expect(html).toMatch(/^<address class="[^"]*extra[^"]*">/);
	});
});

describe("PhysicalAddress", () => {
	test("takes block variants and a class", () => {
		const html = renderToStaticMarkup(<PhysicalAddress address={null} size="xlarge" className="extra" />);
		expect(html).toMatch(/^<address class="[^"]*extra[^"]*">/);
	});
});
