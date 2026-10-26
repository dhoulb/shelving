# CatcherProps

- Kind: interface
- Import: `import { CatcherProps } from "shelving/ui";`
- Extends: `ChildProps`

Props for `<Catcher>` — the `children` to guard plus the `as` component used to render any caught error.

## Signatures

```ts
{
	as: (props: ErrorProps) => ReactElement;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `as` | `(props: ErrorProps) => ReactElement` | Component to render an error (defaults to `<ErrorNotice />`) |
