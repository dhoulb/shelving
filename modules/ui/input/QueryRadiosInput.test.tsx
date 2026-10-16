import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { STRING } from "shelving/schema";
import { QueryRadiosInput } from "shelving/ui";
import { PASSTHROUGH } from "shelving/util/function";

describe("QueryRadiosInput", () => {
	test("shows the input with no popover when `popover={false}`", () => {
		const html = renderToStaticMarkup(
			<QueryRadiosInput popover={false} name="q" schema={STRING} onQuery={() => []} onValue={PASSTHROUGH} />,
		);
		expect(html).toContain('name="q"');
	});
	test("formatter can return a React element, not only a string", () => {
		const element = (
			<QueryRadiosInput<string, string>
				name="q"
				schema={STRING}
				onQuery={() => []}
				formatter={v => <strong>{v}</strong>}
				onValue={PASSTHROUGH}
			/>
		);
		expect(element).toBeTruthy();
	});
});
