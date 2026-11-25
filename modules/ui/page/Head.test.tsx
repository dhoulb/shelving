import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createMeta, Head, MetaContext, Page } from "shelving/ui";

describe("Head", () => {
	test("emits a <link> element when links are set in context", () => {
		const html = renderToStaticMarkup(
			<MetaContext value={createMeta({ root: "http://x.com/", url: "./", links: { icon: "/img/favicon.png" } })}>
				<Head />
			</MetaContext>,
		);
		expect(html).toContain('rel="icon"');
		expect(html).toContain('href="http://x.com/img/favicon.png"');
	});
});

describe("Page", () => {
	test("on the server, a nested page emits its own title and tags", () => {
		const html = renderToStaticMarkup(
			<Page app="App" title="Outer">
				<Page title="Inner" description="About" tags={{ "og:title": "Inner" }}>
					<p>Hi</p>
				</Page>
			</Page>,
		);
		expect(html).toContain("<title>Inner - Outer - App</title>");
		expect(html).toContain('<meta name="description" content="About"/>');
		expect(html).toContain('<meta property="og:title" content="Inner"/>');
	});
});
