# StackButtonProps

- Kind: interface
- Import: `import { StackButtonProps } from "shelving/ui";`
- Extends: `Omit<ButtonProps, "href" | "onClick" | "selected">`

Props for `<StackButton>`: the `stack` it opens, plus the usual `Button` props except `href` and `onClick`.

## Signatures

```ts
{
	readonly stack: AbsolutePath;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `stack` | `AbsolutePath` | Root path of the stack this button opens. It must be one of the `stacks` on `<Navigation>`. Read only. |
