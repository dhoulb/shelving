import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PASSWORD, StringSchema, URL_SCHEMA } from "shelving/schema";
import { StringSchemaInput, TextInput, type TextInputProps } from "shelving/ui";
import { PASSTHROUGH } from "shelving/util/function";

/** A `StringSchema` with a non-identity `format()` (wraps in brackets) so display and published values differ. */
class BracketSchema extends StringSchema {
	override format(str: string): string {
		return str ? `[${str}]` : str;
	}
}

/**
 * Render a `StringSchemaInput` down to its `<input>` element's props, so the event handlers can be called directly.
 * - Neither component uses hooks, so calling them as plain functions is safe without a DOM.
 */
function _getInputProps(schema: StringSchema, onValue: (value: string | undefined) => void, value?: string): _InputProps {
	const props: { schema: StringSchema; name: string; onValue: typeof onValue; value?: string } = { schema, name: "field", onValue };
	if (value !== undefined) props.value = value;
	return TextInput(StringSchemaInput(props).props as TextInputProps).props as _InputProps;
}

/** The `<input>` props the tests read and call. */
interface _InputProps {
	readonly type?: string;
	readonly defaultValue?: string;
	onInput(e: { currentTarget: { value: string } }): void;
	onBlur(e: { currentTarget: { value: string } }): void;
}

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
		const schema = new BracketSchema({});
		const html = renderToStaticMarkup(<StringSchemaInput name="tag" schema={schema} value="  abc  " onValue={PASSTHROUGH} />);

		expect(html).toContain('value="[abc]"');
	});

	test("publishes the sanitized value, not the formatted one", () => {
		// `format()` is for display only — the store must receive a value that re-validates.
		const values: (string | undefined)[] = [];
		const input = _getInputProps(new BracketSchema({}), v => void values.push(v));
		input.onInput({ currentTarget: { value: "  abc  " } });

		expect(values).toEqual(["abc"]);
	});

	test("reformats the displayed value on blur without publishing it", () => {
		const values: (string | undefined)[] = [];
		const input = _getInputProps(new BracketSchema({}), v => void values.push(v));
		const currentTarget = { value: "  abc  " };
		input.onBlur({ currentTarget });

		expect(currentTarget.value).toBe("[abc]");
		expect(values).toEqual([]);
	});

	test("publishes a password unchanged and keeps it displayed on blur", () => {
		// A `PasswordSchema` field must submit the typed password; masking is the `type="password"` input's job.
		const values: (string | undefined)[] = [];
		const input = _getInputProps(PASSWORD, v => void values.push(v), "hunter2");
		input.onInput({ currentTarget: { value: "hunter22" } });
		const currentTarget = { value: "hunter22" };
		input.onBlur({ currentTarget });

		expect(input.type).toBe("password");
		expect(input.defaultValue).toBe("hunter2");
		expect(values).toEqual(["hunter22"]);
		expect(currentTarget.value).toBe("hunter22");
	});

	test("publishes a URL that still validates while displaying its friendly form", () => {
		// `URLSchema.format()` strips the scheme for display; publishing that form would fail re-validation.
		const values: (string | undefined)[] = [];
		const input = _getInputProps(URL_SCHEMA, v => void values.push(v));
		input.onInput({ currentTarget: { value: " https://example.com/path " } });
		const currentTarget = { value: "https://example.com/path" };
		input.onBlur({ currentTarget });

		expect(values).toEqual(["https://example.com/path"]);
		expect(URL_SCHEMA.validate(values[0])).toBe("https://example.com/path");
		expect(currentTarget.value).toBe("example.com/path");
	});
});
