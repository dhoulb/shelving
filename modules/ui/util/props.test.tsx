import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
	Button,
	Card,
	Cell,
	createMeta,
	Field,
	Loading,
	MetaContext,
	Paragraph,
	Popover,
	PopoverButtonInput,
	Span,
	Tag,
	TextInput,
} from "shelving/ui";

/** Render `children` inside the meta context that link-rendering components need. */
function render(children: ReactNode): string {
	return renderToStaticMarkup(<MetaContext value={createMeta({ root: "http://x.com/", url: "./" })}>{children}</MetaContext>);
}

describe("ClassProps", () => {
	test("component renders a `className` string on its root element", () => {
		expect(render(<Paragraph className="spongy">Hi</Paragraph>)).toContain('<p class="spongy">');
		expect(render(<Span className="spongy">Hi</Span>)).toContain('<span class="spongy">');
		expect(render(<Cell className="spongy">Hi</Cell>)).toContain('<td class="spongy">');
	});

	test("component accepts every `Classes` form, not just a string", () => {
		expect(render(<Paragraph className={["spongy", "sparkle"]}>Hi</Paragraph>)).toContain('<p class="spongy sparkle">');
		expect(render(<Paragraph className={{ spongy: true, sparkle: false }}>Hi</Paragraph>)).toContain('<p class="spongy">');
	});

	test("clickable component renders its `className` on the rendered element", () => {
		// `Button` renders through `Clickable`, which picks `<button>` for `onClick` and `<a>` for `href`.
		expect(render(<Button className="spongy" onClick={() => undefined} />)).toContain('<button type="button" class="spongy"');
		expect(render(<Button className="spongy" href="/about" />)).toContain('class="spongy"');
		expect(render(<Tag className="spongy">New</Tag>)).toContain('class="spongy"');
	});

	test("clickable wrapper renders a working `<button>` when only `onClick` is set", () => {
		// `Card` spreads `href={href}` into `Clickable` even when unset — dispatch must pick `<button>` from the defined `onClick`, not a dead `<a>`.
		const html = render(<Card onClick={() => undefined}>Hi</Card>);
		expect(html).toContain("<button");
		expect(html).not.toContain("<a ");
	});

	test("`className` lands on the component's own root, not on its inner elements", () => {
		// `Card` renders the class on its `<article>`, not on the stretched overlay `<a>` it also renders.
		const html = render(
			<Card className="spongy" href="/about">
				Hi
			</Card>,
		);
		expect(html).toContain('<article class="spongy">');
		expect(html).not.toContain('<a class="spongy"');
	});

	test("`Popover` styles its floating panel rather than its wrapper", () => {
		const html = render(
			<Popover className="spongy">
				<button type="button">Open</button>
				<div>Panel</div>
			</Popover>,
		);
		expect(html).toContain('<section class="spongy"');
	});

	test("input component renders its `className` on the input element", () => {
		expect(render(<TextInput className="spongy" name="name" onValue={() => undefined} />)).toContain('class="spongy"');
	});

	test("popover wrapper components render their `className` on the trigger, not the floating panel", () => {
		// `PopoverButtonInput` (and `PopoverButton`/`QueryInput`) style their always-visible trigger — only a bare `<Popover>` styles the panel.
		const html = render(
			<PopoverButtonInput name="pick" className="spongy">
				{["Pick", "Panel"]}
			</PopoverButtonInput>,
		);
		expect(html).toContain('class="spongy"');
		expect(html).toContain("<button");
	});

	test("omitted `className` renders the same markup as `className={undefined}`", () => {
		expect(render(<Field title="Name">Hi</Field>)).toBe(
			render(
				<Field title="Name" className={undefined}>
					Hi
				</Field>,
			),
		);
		expect(render(<Paragraph>Hi</Paragraph>)).not.toContain("spongy");
		// A component with no class of its own renders no `class` attribute at all, rather than an empty one.
		expect(render(<Loading />)).not.toContain("class=");
		expect(render(<Loading className="spongy" />)).toContain('class="spongy"');
	});
});
