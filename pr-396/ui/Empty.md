# Empty

- Kind: component
- Import: `import { Empty } from "shelving/ui";`

Message for a list with nothing in it: centred, grey content with space around it.
- Use it for every empty list, so they all look the same.
- Pass the text as `<Paragraph>` elements, plus any buttons. Each child keeps its own margins.

Message for a list with nothing in it. `<Empty>` shows its content centred and grey, with space around it, so every empty list looks the same.

**Things to know:**

- Pass the text as `<Paragraph>` elements, plus any buttons. Each child keeps its own margins.
- `EMPTY_LOADING` is a loading spinner in an `<Empty>`. Use it as the `fallback` of a `<Loader>` for a list, so the empty message later shows in the same place.
- `<QueryRadiosInput>` and `<QueryCheckboxesInput>` use both for their loading and empty states.

## Usage

### Empty list

```tsx
import { Empty, Paragraph } from "shelving/ui";

<Empty>
	<Paragraph>No challenges yet.</Paragraph>
</Empty>
```

### Loading list

```tsx
import { EMPTY_LOADING, Loader } from "shelving/ui";

<Loader fallback={EMPTY_LOADING}>
	<LoadChallenges />
</Loader>
```

## Styling

`<Empty>` has no own hooks. It is a `<Block>` with `center`, `tint="50"` and `space="xlarge"`, so it reads the `--tint-50` ladder step and `--space-xlarge`.


## Signatures

```ts
Empty({ children, className }: EmptyProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `EmptyProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
