# DictionarySchemaOptions

- Kind: interface
- Import: `import { DictionarySchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Options for `DictionarySchema`.

## Signatures

```ts
{
	readonly items: Schema<T>;
	readonly value?: ImmutableDictionary | undefined;
	readonly min?: number | undefined;
	readonly max?: number | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `items` | `Schema<T>` | Schema every entry value in the dictionary must conform to. Read only. |
| `value` | `ImmutableDictionary \| undefined` | Default dictionary used when the input is `undefined`. Read only. Optional. |
| `min` | `number \| undefined` | Minimum number of entries. Read only. Defaults to `0`. |
| `max` | `number \| undefined` | Maximum number of entries. Read only. Defaults to `Number.POSITIVE_INFINITY`. |
