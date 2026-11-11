# useField()

- Kind: function
- Import: `import { useField } from "shelving/ui";`

Hook that returns the input props for a single named field of a form.
- Subscribes to the form store so the field re-renders when its value or message changes.

## Signatures

```ts
useField(name: string, form?: FormStore<{ [name: string]: T }>): SchemaInputProps<Schema<T>, I>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `name` | `string` | Name of the field to read props for. |
| `form` | `FormStore<{ [name: string]: T }>` | Form store to read from, defaulting to the current form context. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `SchemaInputProps<Schema<T>, I>` | Props (`name`, `schema`, `value`, `onValue`, `message`, `required`) ready to spread onto an input. |

## Examples

```ts
const field = useField("email");
```
