# SchemaOptions

- Kind: type
- Import: `import { SchemaOptions } from "shelving/schema";`

Options allowed by a `Schema` instance.

## Signatures

```ts
{
	readonly one?: string;
	readonly many?: string;
	readonly title?: string | undefined;
	readonly description?: string | undefined;
	readonly placeholder?: string | undefined;
	readonly value?: unknown;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `one` | `string` | String for one of this thing, e.g. `product` or `item` or `sheep` Read only. Optional. |
| `many` | `string` | String for several of this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s") Read only. Optional. |
| `title` | `string \| undefined` | Title of the schema, e.g. for using as the title of a corresponding field. Read only. Optional. |
| `description` | `string \| undefined` | Description of the schema, e.g. for using as a description in a corresponding field. Read only. Optional. |
| `placeholder` | `string \| undefined` | Placeholder of the schema, e.g. for using as a placeholder in a corresponding field. Read only. Optional. |
| `value` | `unknown` | Default value for the schema if `validate()` is called with an `undefined` value. Read only. Optional. |
