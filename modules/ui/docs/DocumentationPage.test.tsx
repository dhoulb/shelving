import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { DocumentationElement } from "../../util/tree.js";
import { MetaContext } from "../misc/MetaContext.js";
import { createMeta } from "../util/meta.js";
import { DocumentationPage } from "./DocumentationPage.js";

/** Make a minimal `tree-documentation` child element of a given kind. */
function doc(name: string, kind: string): DocumentationElement {
	return { type: "tree-documentation", key: name, props: { name, kind } };
}

/** Render inside a `MetaContext` — the page's `<TreeBreadcrumbs>` reads the current URL from it. */
function render(node: ReactNode, url = "./array"): string {
	return renderToStaticMarkup(<MetaContext value={createMeta({ root: "http://x.com/", url })}>{node}</MetaContext>);
}

describe("DocumentationPage", () => {
	test("groups child symbols into kind-based sections, in order", () => {
		const html = render(
			<DocumentationPage path="/array" name="array">
				{[doc("getThing", "function"), doc("Widget", "class"), doc("getOther", "function")]}
			</DocumentationPage>,
		);
		expect(html).toContain("Functions");
		expect(html).toContain("Classes");
		// Sections render in `KIND_SECTIONS` order — functions before classes.
		expect(html.indexOf("Functions")).toBeLessThan(html.indexOf("Classes"));
	});

	test("renders a section only for kinds that have children", () => {
		const html = render(
			<DocumentationPage path="/Store" name="Store" kind="class">
				{[doc("get", "method")]}
			</DocumentationPage>,
			"./Store",
		);
		expect(html).toContain("Methods");
		expect(html).not.toContain("Functions");
		expect(html).not.toContain("Interfaces");
	});

	test("renders properties as a table with dot-prefixed names, dropping `| undefined` as optional", () => {
		const html = render(
			<DocumentationPage
				path="/Opts"
				name="Opts"
				kind="interface"
				properties={[
					{ name: "caller", type: "AnyCaller | undefined", description: "The caller." },
					{ name: "id", type: "string", description: "The id." },
					{ name: "timeout", type: "number", description: "The timeout.", default: "20000" },
					{ name: "size", type: "number", description: "The size.", readonly: true },
				]}
			/>,
			"./Opts",
		);
		// Dedicated Properties table with dot-prefixed names.
		expect(html).toContain(">Property</th>");
		expect(html).toContain(">.caller</code>");
		expect(html).toContain(">.timeout</code>");
		// `| undefined` is dropped from the type and marks the property optional (no `Required.`).
		expect(html).toContain(">AnyCaller</code>");
		expect(html).not.toContain(">undefined</code>");
		// A property with no default and no optionality is marked `Required.`; one with a default surfaces `Defaults to …`.
		expect(html).toContain("Required.");
		expect(html).toContain("Defaults to");
		expect(html).toContain("20000");
		// A read-only property appends `Readonly` at the end of its description.
		expect(html).toContain("Readonly");
	});

	test("renders parameters as a table, folding any default into the description as a `Defaults to …` line", () => {
		const html = render(
			<DocumentationPage
				path="/makeThing"
				name="makeThing"
				kind="function"
				params={[
					{ name: "name", type: "string", description: "The name." },
					{ name: "required", type: "boolean", description: "Whether required.", optional: true, default: "false" },
				]}
				returns={[{ type: "Thing", description: "The new thing." }]}
			/>,
			"./makeThing",
		);
		// Parameters table headers — name and type only; the default lives in the description column now (header cells carry a class, so match on the closing tag).
		expect(html).toContain(">Param</th>");
		expect(html).toContain(">Type</th>");
		expect(html).not.toContain(">Default</th>");
		// A param with a default surfaces it as a `Defaults to …` note in its description; a param with neither a default nor optionality is marked `Required.`.
		expect(html).toContain("Defaults to");
		expect(html).toContain("false");
		expect(html).toContain("Required.");
		// Returns table headers.
		expect(html).toContain(">Return</th>");
		expect(html).toContain("The new thing.");
	});

	test("splits a union type onto one linked token per member, dropping `undefined` as an optionality marker", () => {
		const html = render(
			<DocumentationPage
				path="/make"
				name="make"
				kind="function"
				params={[
					// A real multi-member union stacks each member on its own line (separated by a `<br>`).
					{ name: "data", type: "Schemas | DataSchema", description: "The data schema." },
					// A `T | undefined` reads as optional: the `undefined` member is dropped and no `Required.` is added.
					{ name: "caller", type: "AnyCaller | undefined", description: "The caller." },
				]}
			/>,
			"./make",
		);
		// Each union member renders as its own `<code>` token, stacked with a line break.
		expect(html).toContain(">Schemas</code><br/><code");
		expect(html).toContain(">DataSchema</code>");
		// `data` is a genuine required union (no default, no `| undefined`), so it is marked `Required.`.
		expect(html).toContain(">AnyCaller</code>");
		// The `undefined` member is never shown — neither as a type token nor leaking into the description.
		expect(html).not.toContain(">undefined</code>");
		// The `caller` param read as optional, so its description carries no `Required.` note (the cell ends right after the description).
		expect(html).toContain("The caller.</div></td>");
	});

	test("renders param descriptions as inline markup rather than literal source", () => {
		const html = render(
			<DocumentationPage
				path="/configure"
				name="configure"
				kind="function"
				params={[{ name: "label", type: "string", description: "The `code` label." }]}
			/>,
			"./configure",
		);
		// Backticks in the description parse to a `<code>` token rather than rendering literally.
		expect(html).toContain("<code");
		expect(html).not.toContain("`code`");
	});

	test("groups static methods into their own section, before instance methods", () => {
		const html = render(
			<DocumentationPage path="/Color" name="Color" kind="class">
				{[doc("from", "static method"), doc("toString", "method")]}
			</DocumentationPage>,
			"./Color",
		);
		expect(html).toContain("Static methods");
		expect(html).toContain("Methods");
		// Static methods render before instance methods (the `Methods` heading uses a capital, so it doesn't match inside `Static methods`).
		expect(html.indexOf("Static methods")).toBeLessThan(html.indexOf("Methods"));
	});
});
