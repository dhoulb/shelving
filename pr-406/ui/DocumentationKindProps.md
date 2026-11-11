# DocumentationKindProps

- Kind: interface
- Import: `import { DocumentationKindProps } from "shelving/ui";`
- Extends: `TagProps`

Props for `DocumentationKind` — a `TagProps` plus the documented symbol's `kind`.

## Signatures

```ts
{
	readonly kind: string;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `kind` | `string` | The documentation kind (e.g. `"component"`, `"function"`, `"class"`, `"interface"`, `"type"`, `"constant"`, `"method"`, `"static method"`, `"property"`, `"static property"`). Read only. |
