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

	test("renders no back button without an href when the stack has no page before this one", () => {
		const html = renderToStaticMarkup(
			<Navigation url="http://x.com/home" stacks={["/home", "/profile"]}>
				<BackButton>Back</BackButton>
			</Navigation>,
		);
		expect(html).toBe("");
	});

	test("renders a stack button as a link to its root, selected in the starting stack", () => {
		const html = renderToStaticMarkup(
			<Navigation url="http://x.com/profile/settings" stacks={["/home", "/profile"]} stack="/profile">
				<StackButton stack="/home">Home</StackButton>
				<StackButton stack="/profile">Profile</StackButton>
			</Navigation>,
		);
		expect(html).toContain('<a href="http://x.com/home">Home</a>');
		expect(html).toContain('<a href="http://x.com/profile" aria-current="true">Profile</a>');
	});

	test("selects no stack button on a floating page", () => {
		const html = renderToStaticMarkup(
			<Navigation url="http://x.com/settings" stacks={["/home", "/profile"]}>
				<StackButton stack="/home">Home</StackButton>
				<StackButton stack="/profile">Profile</StackButton>
			</Navigation>,
		);
		expect(html).not.toContain("aria-current");
	});

	test("selects no stack button on a floating page when / is a stack", () => {
		const html = renderToStaticMarkup(
			<Navigation url="http://x.com/post/1" stacks={["/", "/profile"]}>
				<StackButton stack="/">Home</StackButton>
				<StackButton stack="/profile">Profile</StackButton>
			</Navigation>,
		);
		expect(html).not.toContain("aria-current");
	});
});
