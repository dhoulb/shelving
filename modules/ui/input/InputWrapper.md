# InputWrapper

A box that holds an input and an icon on one or both sides. The icon sits inside the input's border, and the input text moves clear of it.

**Things to know:**

- Put the input inside, with an icon before it, after it, or both.
- Mark each icon with a `data-slot` attribute. The first child with `data-slot` goes on the left, and the last goes on the right.
- An icon is `--input-icon-size` square, centred from top to bottom. It does not take taps, so a tap reaches the input.
- The wrapper draws the border and focus ring. The input inside has no border, padding or margin of its own.

## Usage

```tsx live
import { InputWrapper, TextInput } from "shelving/ui";
import { InfoIcon } from "shelving/icon/InfoIcon";
import { CloseIcon } from "shelving/icon/CloseIcon";

<InputWrapper>
	<InfoIcon data-slot="icon" />
	<TextInput name="search" title="Search" onValue={() => {}} />
</InputWrapper>
<InputWrapper>
	<TextInput name="code" title="Code" onValue={() => {}} />
	<CloseIcon data-slot="icon" />
</InputWrapper>
```

## Styling

`InputWrapper` uses the shared input styles. See `getInputClass()` for the `--input-*` hooks. `--input-icon-size` sets the icon size, and `--input-indent` sets the space each side of an icon.
