import { describe, expect, test } from "bun:test";
import type { ReactElement } from "react";
import { DateInput, FileInput, NumberInput, TextInput } from "shelving/ui";
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
