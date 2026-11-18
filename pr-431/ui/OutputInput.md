# OutputInput

- Kind: component
- Import: `import { OutputInput } from "shelving/ui";`

Show static read-only content styled as an input, falling back to `placeholder` when empty.

## Signatures

```ts
OutputInput({ title, placeholder, children = title, className, ...props }: OutputInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `OutputInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | An `<output>` element styled like an input. |

## Examples

```ts
<OutputInput title="Status">Active</OutputInput>
```
