# SelectProps

- Kind: interface
- Import: `import { SelectProps } from "shelving/ui";`
- Extends: `ValueInputProps<T>`

Props for `SelectInput`, a dropdown `<select>` bound to a string value.

## Signatures

```ts
{
	options: ChoiceOptions<T>;
	groups?: ChoiceGroups<T> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `options` | `ChoiceOptions<T>` | The options for the select. |
| `groups` | `ChoiceGroups<T> \| undefined` | Show the options under named headings, as `<optgroup>` elements. Options in no group show first. Optional. |
