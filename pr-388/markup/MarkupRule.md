# MarkupRule

- Kind: interface
- Import: `import { MarkupRule } from "shelving/markup";`

A single markup rule: a regular expression that matches a span of input plus a renderer that turns the match into an element.
- Rules are grouped into priority tiers and resolved highest tier first by `MarkupParser`.
- A rule renders only in the contexts it lists, letting the same syntax behave differently in block vs inline vs list context.

## Signatures

```ts
{
	regexp: RegExp;
	render(key: string, data: NamedRegExpData | undefined, parser: MarkupParser): ReactElement;
	contexts: MarkupContexts;
	priority: number;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `regexp` | `RegExp` | Regular expression used for matching the rule. |
| `contexts` | `MarkupContexts` | One or more contexts this rule should render in. |
| `priority` | `number` | Priority for this rule (higher priority rules override lower priority rules). |

## Methods

- [render](MarkupRule/render.md): Use the matched data to render an element.
