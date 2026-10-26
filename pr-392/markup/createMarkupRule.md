# createMarkupRule()

- Kind: function
- Import: `import { createMarkupRule } from "shelving/markup";`

Create a typed `MarkupRule` from a `NamedRegExp`, a renderer, its contexts, and an optional priority.

*Factory for `MarkupRule`.*

- The overload taking a `NamedRegExp<T>` infers the named capture groups handed to `render`.
- Higher `priority` rules are resolved (and masked) before lower-priority ones.

## Signatures

```ts
createMarkupRule(regexp: NamedRegExp<T>, render: (key: string, data: T, parser: MarkupParser) => ReactElement, contexts: MarkupContexts, priority?: number): MarkupRule
createMarkupRule(regexp: RegExp, render: (key: string, data: EmptyDictionary, parser: MarkupParser) => ReactElement, contexts: MarkupContexts, priority?: number): MarkupRule
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `regexp` | `NamedRegExp<T>` | Regular expression used to match the rule (a `NamedRegExp` to type the render data). |
| `render` | `(key: string, data: T, parser: MarkupParser) => ReactElement` | Renderer turning a `key`, the matched `data`, and the active `parser` into a `ReactElement`. |
| `contexts` | `MarkupContexts` | One or more contexts this rule renders in (e.g. `["block"]`). |
| `priority` | `number` | Tier priority — higher rules override lower ones (defaults to `0`). Optional. |
| `regexp` | `RegExp` |  |
| `render` | `(key: string, data: EmptyDictionary, parser: MarkupParser) => ReactElement` |  |
| `contexts` | `MarkupContexts` |  |
| `priority` | `number` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `MarkupRule` | A `MarkupRule` ready to add to a `MarkupRules` list. |
| `MarkupRule` |  |

## Examples

```ts
const HR_RULE = createMarkupRule(/^---$/m, key => <hr key={key} />, ["block"]);
```
