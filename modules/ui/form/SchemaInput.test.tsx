import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { StringSchema } from "../../schema/index.js";
import { PASSTHROUGH } from "../../util/function.js";
import { StringSchemaInput } from "./SchemaInput.js";

describe("StringSchemaInput", () => {
	test("formats the initial value to its clean sanitized value", () => {
		// The `formatter` runs `schema.sanitize()` then `schema.format()`, so runs of whitespace collapse and the value trims.
		const schema = new StringSchema({});
		const html = renderToStaticMarkup(<StringSchemaInput name="title" schema={schema} value="  hello   world  " onValue={PASSTHROUGH} />);

		expect(html).toContain('value="hello world"');
	});

	test("applies the schema case when sanitizing", () => {
		// An `upper` schema sanitizes to uppercase, so the clean value is uppercased.
		const schema = new StringSchema({ case: "upper" });
		const html = renderToStaticMarkup(<StringSchemaInput name="code" schema={schema} value="  ab cd  " onValue={PASSTHROUGH} />);

		expect(html).toContain('value="AB CD"');
	});

	test("applies a subclass `format()` after sanitizing", () => {
		// A subclass `format()` is non-identity (here wrapping in brackets), so the clean value is sanitized then formatted.
		class BracketSchema extends StringSchema {
			override format(str: string): string {
				return str ? `[${str}]` : str;
			}
		}
		const schema = new BracketSchema({});
		const html = renderToStaticMarkup(<StringSchemaInput name="tag" schema={schema} value="  abc  " onValue={PASSTHROUGH} />);

		expect(html).toContain('value="[abc]"');
	});
});
