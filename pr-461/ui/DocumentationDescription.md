# DocumentationDescription

- Kind: component
- Import: `import { DocumentationDescription } from "shelving/ui";`

Render a documentation table row's description cell.
- The description is parsed as inline markup via `TreeMarkup` (`context="inline"`), so backticks, emphasis and links resolve rather than showing as literal source — and each inline-code span auto-links to its documented token when one exists.
- When a `default` is given it renders a trailing `Defaults to …` note on the same line (linking the value when it's a documented token); otherwise, when `optional` is explicitly `false`, it renders a `required` `<Tag>`. (Optionality has no tag — it's implicit, and an optional value usually carries the longer `Defaults to …` text instead.)
- When `readonly` is set, a `readonly` `<Tag>` is appended at the very end (after any default/required note).
- Wrapped in `<Prose>` so markup-produced `<code>` (and other inline) elements pick up the standard prose typography (the chip background, etc.) — a bare `<code>` is only styled inside a `.prose` ancestor.

## Signatures

```ts
DocumentationDescription({ description, default: def, optional, readonly }: DocumentationDescriptionProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationDescriptionProps` |  |
| `.description` | `string \| undefined` | Already-resolved description text (hand-written, or fallen back to the referenced type's own description), rendered as inline markup. Read only. Optional. |
| `.default` | `string \| undefined` | Default-value expression — rendered as a trailing `Defaults to …` note (linked when it's a documented token). Read only. Optional. |
| `.optional` | `boolean \| undefined` | Whether the value is optional — pass an explicit boolean to opt into the note: `false` appends `Required.` (when there's no default), `true` appends nothing. Leave `undefined` to suppress the note entirely (e.g. for returns/throws). Read only. Optional. |
| `.readonly` | `boolean \| undefined` | Whether the value is read-only — appends a trailing `Readonly` note at the very end (after any `Defaults to …` / `Required.`). Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Examples

```ts
<DocumentationDescription description="The `foo` value." optional={false} readonly />
```
