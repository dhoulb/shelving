import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { STRING } from "shelving/schema";
import { ArrayCheckboxInputs, QueryCheckboxesInput } from "shelving/ui";
import { PASSTHROUGH } from "shelving/util/function";

describe("QueryCheckboxesInput", () => {
	test("shows the input with no popover when `popover={false}`", () => {
		const html = renderToStaticMarkup(
			<QueryCheckboxesInput popover={false} name="q" schema={STRING} onQuery={() => []} onValue={PASSTHROUGH} />,
		);
		expect(html).toContain('name="q"');
	});
	test("value is an array of items", () => {
		const element = (
			<QueryCheckboxesInput<string, string>
				name="q"
				schema={STRING}
				onQuery={() => []}
				value={["a"]}
				onValue={(v: readonly string[] | undefined) => v}
			/>
		);
		expect(element).toBeTruthy();
	});
});

describe("ArrayCheckboxInputs", () => {
	test("renders a checked checkbox for each item in the value", () => {
		const html = renderToStaticMarkup(<ArrayCheckboxInputs name="x" items={["a", "b", "c"]} value={["b"]} onValue={PASSTHROUGH} />);
		expect(html.match(/type="checkbox"/g)?.length).toBe(3);
		expect(html.match(/checked=""/g)?.length).toBe(1);
	});
	test("adds and removes items", () => {
		const values: (readonly string[] | undefined)[] = [];
		const element = ArrayCheckboxInputs({ name: "x", items: ["a", "b"], value: ["a"], onValue: v => values.push(v) });
		const [a, b] = (element.props as { children: { props: { onValue(on: boolean): void } }[] }).children;
		b?.props.onValue(true);
		a?.props.onValue(false);
		expect(values).toEqual([["a", "b"], []]);
	});
});
