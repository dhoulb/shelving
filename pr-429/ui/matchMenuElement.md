# matchMenuElement()

- Kind: function
- Import: `import { matchMenuElement } from "shelving/ui";`

Match an element that should appear in the sidebar menu.

- Generic tree elements (directories and files) always qualify.
- For documentation elements, only `kind: "module"` qualifies — functions, classes, methods, properties, etc. are kept off the navigation.

## Signatures

```ts
matchMenuElement(element: Element): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `element` | `Element` | The element to test. |
| `.type` | `string \| ((props: P) => Elements \| null)` | Read only. |
| `.props` | `P` | Read only. |
| `.key` | `string \| null` | Read only. |
| `.$$typeof` | `symbol` | Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` when the element should appear in the menu, `false` otherwise. |

## Examples

```ts
matchMenuElement(element) // true
```
