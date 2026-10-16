import { describe, expect, test } from "bun:test";
import type { ReactElement } from "react";
import { DateInput, FileInput, ImageInput, NumberInput, TextInput } from "shelving/ui";
import { PASSTHROUGH } from "shelving/util/function";

/** The props of the rendered element that the tests read. */
interface _ElementProps {
	readonly onInput?: unknown;
	readonly onChange?: unknown;
}

describe("value inputs", () => {
	// React's `onChange` already fires for each native `input` event, so a second `onInput` handler would call `onValue()` twice.
	const elements: [string, ReactElement][] = [
		["TextInput", TextInput({ name: "x", onValue: PASSTHROUGH })],
		["TextInput (multiline)", TextInput({ name: "x", rows: 3, onValue: PASSTHROUGH })],
		["NumberInput", NumberInput({ name: "x", onValue: PASSTHROUGH })],
		["DateInput", DateInput({ name: "x", onValue: PASSTHROUGH })],
		["FileInput", FileInput({ name: "x", onValue: PASSTHROUGH })],
	];
	for (const [label, element] of elements) {
		test(`${label} listens to change only, so it calls onValue once per edit`, () => {
			const props = element.props as _ElementProps;
			expect(props.onChange).toBeFunction();
			expect(props.onInput).toBeUndefined();
		});
	}
});

describe("FileInput", () => {
	test("calls onValue once for the picked file", () => {
		const values: (string | File | undefined)[] = [];
		const file = new File(["abc"], "a.txt");
		const element = FileInput({ name: "x", onValue: v => void values.push(v) });
		(element.props as { onChange(e: { currentTarget: { files: File[] } }): void }).onChange({ currentTarget: { files: [file] } });
		expect(values).toEqual([file]);
	});
});

describe("ImageInput", () => {
	type _Element = ReactElement<{ children: ReactElement<{ children: ReactElement[] }>[] }>;
	function _parts(element: ReactElement) {
		const [label, clear] = (element as _Element).props.children;
		const [shown, input] = (label as ReactElement<{ children: ReactElement[] }>).props.children;
		return {
			shown: shown as ReactElement<Record<string, unknown>>,
			input: input as ReactElement<Record<string, unknown>>,
			clear: clear as unknown as ReactElement<Record<string, unknown>> | false | undefined,
		};
	}
	test("shows the Choose… button and no clear button when empty", () => {
		const { shown, clear } = _parts(ImageInput({ name: "x", onValue: PASSTHROUGH }));
		expect(shown.type).toBe("span");
		expect(shown.props.children).toBe("Choose…");
		expect(clear).toBeFalsy();
	});
	test("shows the image and a clear button for a URL value", () => {
		const { shown, clear } = _parts(ImageInput({ name: "x", value: "https://x.com/a.jpg", onValue: PASSTHROUGH }));
		expect(shown.props.value).toBe("https://x.com/a.jpg");
		expect(clear).toBeTruthy();
	});
	test("calls onValue with the picked file, and with undefined on clear", () => {
		const values: (File | undefined)[] = [];
		const file = new File(["abc"], "a.jpg");
		const { input, clear } = _parts(ImageInput({ name: "x", value: "https://x.com/a.jpg", onValue: v => void values.push(v) }));
		(input.props.onChange as (e: { currentTarget: { files: File[] } }) => void)({ currentTarget: { files: [file] } });
		((clear as ReactElement<Record<string, unknown>>).props.onClick as (e: unknown) => void)({ currentTarget: { parentElement: null } });
		expect(values).toEqual([file, undefined]);
	});
});
