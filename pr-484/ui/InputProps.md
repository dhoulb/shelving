# InputProps

- Kind: interface
- Import: `import { InputProps } from "shelving/ui";`
- Extends: `ClassProps`

Base props shared by every form input (name, title, placeholder, required/disabled state, and error message).

## Signatures

```ts
{
	name: string;
	title?: string | undefined;
	placeholder?: string | undefined;
	required?: boolean | undefined;
	disabled?: boolean | undefined;
	message?: string | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | The `name=""` prop of the input. |
| `title` | `string \| undefined` | Friendly title for the input. Optional. |
| `placeholder` | `string \| undefined` | Placeholder for the input. Defaults to `title`. Set to `""` to show no placeholder. Optional. |
| `required` | `boolean \| undefined` | Whether the input is required. Optional. |
| `disabled` | `boolean \| undefined` | Whether the input is disabled. Optional. |
| `message` | `string \| undefined` | Any error message for the input. Optional. |
