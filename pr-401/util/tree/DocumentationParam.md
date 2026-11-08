# DocumentationParam

- Kind: interface
- Import: `import { DocumentationParam } from "shelving/util/tree";`

A single parameter for a documented code symbol.

## Signatures

```ts
{
	readonly name: string;
	readonly type?: string | undefined;
	readonly description?: string | undefined;
	readonly optional?: boolean | undefined;
	readonly default?: string | undefined;
	readonly readonly?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Read only. |
| `type` | `string \| undefined` | Type expression (e.g. `"string"`, `"number"`); renderers default to `"unknown"` when missing. Read only. Optional. |
| `description` | `string \| undefined` | Read only. Optional. |
| `optional` | `boolean \| undefined` | Read only. Optional. |
| `default` | `string \| undefined` | Default-value expression from the parameter's initializer (e.g. `"false"`, `"{}"`), or `undefined` when the parameter has none. Read only. Optional. |
| `readonly` | `boolean \| undefined` | Whether this is a read-only data member (a `readonly` property, or a getter with no matching setter). Only meaningful for `properties`, not function params. Read only. Optional. |
