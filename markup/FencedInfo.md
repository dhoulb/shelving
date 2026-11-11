# FencedInfo

- Kind: interface
- Import: `import { FencedInfo } from "shelving/markup";`

Parts of the info string that follows the opening fence of a fenced code block.

## Signatures

```ts
{
	readonly language: string;
	readonly flags: ImmutableArray<string>;
	readonly title: string;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `language` | `string` | Language of the code, e.g. `"tsx"`, or `""` if the info string has no language. Read only. |
| `flags` | `ImmutableArray<string>` | Flags that follow the language, e.g. `["live"]`. Read only. |
| `title` | `string` | Title to show above the code, or `""` if the info string has no title. Read only. |
