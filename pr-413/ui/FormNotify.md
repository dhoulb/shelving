# FormNotify()

- Kind: function
- Import: `import { FormNotify } from "shelving/ui";`

Publish the current form's "main" (unnamed) message as a global success notice whenever it changes.
- Renders nothing; mount it inside a `Form` to surface the message globally.

## Signatures

```ts
FormNotify(): void
```

## Returns

| Type | Description |
| --- | --- |
| `void` | Nothing — this component only triggers a side effect. |

## Examples

```ts
<FormNotify />
```
