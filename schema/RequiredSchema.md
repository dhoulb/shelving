# RequiredSchema

- Kind: class
- Import: `import { RequiredSchema } from "shelving/schema";`
- Extends: `ThroughSchema<T>`

Schema that wraps a source schema but rejects a falsy result.

- Delegates to the source schema, then throws `"Required"` if the validated value is falsy.

## Signatures

```ts
new RequiredSchema<T>()
```

## Returns

| Type | Description |
| --- | --- |
| `RequiredSchema<T>` |  |

## Examples

```ts
const schema = new RequiredSchema({ source: STRING });
 schema.validate("abc"); // Returns "abc"
 schema.validate(""); // Throws "Required"
```
