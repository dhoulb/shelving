import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createMeta, Head, MetaContext } from "shelving/ui";

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
