# Definitions

- Kind: component
- Import: `import { Definitions } from "shelving/ui";`

Description list — a sequence of term/value pairs rendered as a `<dl>`.
- Children are raw `<dt>` / `<dd>` elements — `<dt>` is the term label, `<dd>` the value, stacked term-above-value.
- The spacing between pairs is overridable via the `--definitions-gap` hook.

## Signatures

```ts
Definitions({ children, className, ...props }: DefinitionsProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DefinitionsProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<Definitions><dt>Name</dt><dd>Acme</dd></Definitions>
```
