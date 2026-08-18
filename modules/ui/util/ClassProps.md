# ClassProps

The shared `className` prop every component accepts — an app class merged *after* the classes the component computes for itself.

**Things to know:**

- CSS-module class names are hashed, so an app stylesheet can't target a component instance on its own. `className` is the sanctioned way to attach an app class to a specific instance.
- It's merged **last**, and an app's global stylesheet is unlayered, so its rules beat the library's `@layer components` rules without a specificity fight.
- It accepts any `Classes` value — a string, a nested array, or a dictionary whose `true` keys become class names — because it goes through `getClass()` like every other class the component composes.
- It lands on the component's **own root element**. A component that renders more than one element (`<Card>`'s stretched overlay link, `<Field>`'s inner input) keeps the class on the outer one.
- Tokens and per-property hooks (`--card-background`, `--button-radius`, …) remain the primary theming surface. Reach for `className` for a composed one-off treatment those can't express — a keyframe animation, a bespoke gradient, a transform on press — not to restyle a component everywhere.

## Usage

### Attaching an app class

```tsx
import { Button } from "shelving/ui";

// `.spongy-press` lives in the app's own global stylesheet.
<Button className="spongy-press" strong onClick={claim}>
	Claim
</Button>;
```

```css
/* style.css — unlayered, so it beats the library's `@layer components` rules. */
.spongy-press:active {
	transform: scale(0.96);
}
```

### Conditional classes

```tsx
import { Card } from "shelving/ui";

// Arrays and `true`-flag dictionaries work too — anything `Classes` allows.
<Card className={["claim-card", { sparkle: isNew }]} href={path}>
	{content}
</Card>;
```

### Adding it to your own component

```tsx
import { type ClassProps, getClass } from "shelving/ui";

export interface AddressProps extends BlockVariants, ChildProps, ClassProps {}

export function Address({ children, className, ...props }: AddressProps): ReactElement {
	// Merge `className` last so a caller's class wins.
	return <address className={getClass(ADDRESS_CLASS, getBlockClass(props), className)}>{children}</address>;
}
```
