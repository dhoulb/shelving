# Schema

- Kind: class
- Import: `import { Schema } from "shelving/schema";`
- Implements: `Validator<T>`

Schema is an object instance with a `validate()` method that converts unknown input into a known, valid type `T`.
- Type `T` represents the type of value `validate()` returns.
- `validate()` throws a `string` error message if the value was not valid.

## Signatures

```ts
new Schema<T>({ one = "value", many = `${one}s`, title, description, placeholder, value }: SchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `SchemaOptions` |  |
| `.one` | `string` | String for one of this thing, e.g. `product` or `item` or `sheep` Read only. Optional. |
| `.many` | `string` | String for several of this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s") Read only. Optional. |
| `.title` | `string \| undefined` | Title of the schema, e.g. for using as the title of a corresponding field. Read only. Optional. |
| `.description` | `string \| undefined` | Description of the schema, e.g. for using as a description in a corresponding field. Read only. Optional. |
| `.placeholder` | `string \| undefined` | Placeholder of the schema, e.g. for using as a placeholder in a corresponding field. Read only. Optional. |
| `.value` | `unknown` | Default value for the schema if `validate()` is called with an `undefined` value. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `Schema<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `one` | `string` | String for one of this thing, e.g. `product` or `item` or `sheep` Read only. |
| `many` | `string` | String for several of this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s") Read only. |
| `title` | `string \| undefined` | Title of the schema, e.g. for using as the title of a corresponding field. Read only. |
| `description` | `string \| undefined` | Description of the schema, e.g. for using as a description in a corresponding field. Read only. |
| `placeholder` | `string \| undefined` | Placeholder of the schema, e.g. for using as a placeholder in a corresponding field. Read only. |
| `value` | `unknown` | Default value for the schema if `validate()` is called with an `undefined` value. Read only. |

## Examples

```ts
class CustomSchema extends Schema<string> {
 	validate(unsafeValue: unknown): string {
 		if (typeof unsafeValue !== "string") throw "Must be string";
 		return unsafeValue;
 	}
 }
```

## Methods

- [Schema.validate()](Schema/validate.md): Validate an unknown input value and return a known, valid value of type T.
- [Schema.format()](Schema/format.md): Format a validated value of this type as a string for display.
