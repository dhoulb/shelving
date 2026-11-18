# PopoverChildren

- Kind: type
- Import: `import { PopoverChildren } from "shelving/ui";`

Children tuple for `Popover`: a leading trigger node followed by the popover's contents.

## Signatures

```ts
readonly [
	/**
	 * First child of the <Popover> is element that activates the popover.
	 * - Should be a `<Button>` or `<Input>` that activates or provides the children.
	 */
	trigger: ReactNode,
	/**
	 * Remaining children are the contents of the popover.
	 */
	...popover: ReactNode[],
]
```

## Types

- `ReactNode`
