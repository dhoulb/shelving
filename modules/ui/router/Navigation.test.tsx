import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BackButton, Navigation, requireMetaURL, StackButton } from "shelving/ui";

/** Render `requireMetaURL().path` from inside a component so its `use(MetaContext)` call is valid. */
function Probe(): ReactNode {
	return requireMetaURL().path;
}

describe("Navigation", () => {
	test("publishes merged meta with a root derived from the url", () => {
		const html = renderToStaticMarkup(
			<Navigation url="http://x.com/a/b">
				<Probe />
			</Navigation>,
		);
		expect(html).toBe("/a/b");
	});

	test("resolves a relative url against an explicit root", () => {
		const html = renderToStaticMarkup(
			<Navigation root="http://x.com/app/" url="./sub">
				<Probe />
			</Navigation>,
		);
		expect(html).toBe("/sub");
	});

	test("renders a back button as a link to its href with a back class", () => {
		const html = renderToStaticMarkup(
			<Navigation url="http://x.com/home/post/1" stacks={["/home", "/profile"]}>
				<BackButton href="/home">Back</BackButton>
			</Navigation>,
		);
		expect(html).toContain('href="http://x.com/home"');
		expect(html).toContain('class="back"');
	});

	test("renders a stack button as a link to its root, selected by path", () => {
		const html = renderToStaticMarkup(
			<Navigation url="http://x.com/home/post/1" stacks={["/home", "/profile"]}>
				<StackButton stack="/home">Home</StackButton>
				<StackButton stack="/profile">Profile</StackButton>
			</Navigation>,
		);
		expect(html).toContain('href="http://x.com/home"');
		expect(html).toContain('href="http://x.com/profile"');
		expect(html.match(/aria-current/g)?.length).toBe(1);
	});
});
