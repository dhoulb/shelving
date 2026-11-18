# BackButtonProps

- Kind: interface
- Import: `import { BackButtonProps } from "shelving/ui";`
- Extends: `Omit<ButtonProps, "href" | "onClick">`

Props for `<BackButton>`: the `href` to go back to when the stack has no page before this one, plus the usual `Button` props except `onClick`.

## Signatures

```ts
{
	readonly href: AbsolutePath;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `href` | `AbsolutePath` | Where to go back to when the current stack has no page before this one (for example, the app was opened at this page). Read only. |
