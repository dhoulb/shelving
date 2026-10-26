# TransitionProps

- Kind: interface
- Import: `import { TransitionProps } from "shelving/ui";`
- Extends: `ChildProps`

React props for `<Transition>` component.

## Signatures

```ts
{
	default?: string | undefined;
	forward?: string | undefined;
	back?: string | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `default` | `string \| undefined` | The default CSS class. Optional. |
| `forward` | `string \| undefined` | The CSS class to apply when the transition is moving forward. Optional. |
| `back` | `string \| undefined` | The CSS class to apply when the transition is moving backward. Optional. |
