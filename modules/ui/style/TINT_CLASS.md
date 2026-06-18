# TINT_CLASS

All colour in the library flows from a single anchor variable, **`--tint-50`**, defined in `Tint.module.css`. From that one hue a 21-step ladder — `--tint-00`, `--tint-05`, … `--tint-95`, `--tint-100` — is computed with `color-mix()` in OKLCH: `--tint-00` is black, `--tint-50` is the anchor hue itself, `--tint-100` is white, and every step in between mixes the anchor toward one extreme or the other.

The anchor defaults to `--color-gray`, so the default ladder is a neutral grey ramp — grey is just the colour you get when nothing moves the anchor. The page baseline paints from the extremes: `body { color: var(--tint-00); background: var(--tint-100); }`.

## The recompute trick

The ladder is computed at `:root` and *recomputed* under `TINT_CLASS` (the `.tint` class). That recomputation is the whole trick: move the anchor at any scope, apply `TINT_CLASS`, and all 21 shades rebuild from the new hue at that scope. Colour and status classes are exactly that — they only move the anchor:

```css
/* Color.module.css — a colour variant just moves the anchor. */
.red {
	--tint-50: var(--color-red);
}

/* Status.module.css — a status maps a semantic name onto a palette colour. */
.success {
	--tint-50: var(--color-success);
}
```

[`getColorClass`](/ui/getColorClass) and [`getStatusClass`](/ui/getStatusClass) compose `TINT_CLASS` automatically, so `<Card color="red">` is: move the anchor to red, rebuild the ladder, and let the card paint from the same steps it always paints from. Descendants inherit the rebuilt ladder, which is why a [`Tag`](/ui/Tag) or [`Preformatted`](/ui/Preformatted) nested in a red card tints to match it.

## How components paint from the ladder

Components paint from the ladder by convention:

| Step | Used for |
|---|---|
| `--tint-00` | Body text, headings — maximum contrast |
| `--tint-50` | The hue itself — accents, labels, `Tag` backgrounds, `strong` button backgrounds |
| `--tint-80` | Borders |
| `--tint-90` | Surfaces — [`Card`](/ui/Card), `Preformatted`, [`Button`](/ui/Button) backgrounds |
| `--tint-95` | Hover state of those surfaces |
| `--tint-100` | The page background; text on `--tint-50` backgrounds |

Pairings follow contrast: long text reads at `00`-on-`90` or `00`-on-`100`; short labels read at `100`-on-`50`.

## Theming

A theme is a CSS file of custom-property overrides at `:root`, imported after the base styles. Work from broadest to narrowest:

1. **Move a palette colour.** Overriding `--color-gray` moves the default anchor, retinting every neutral ladder in the app — the broadest possible change. Overriding `--color-red`, `--color-primary`, etc. re-aims every variant and status that maps to it.
2. **Retint one component family.** Set its tint hook: `--card-tint: var(--color-purple)` makes all cards (and their nested content) purple-tinted, with text, border, surface, and hover shades all derived for free.
3. **Override one property.** Per-property hooks are the scalpel: `--button-radius: 999px`, `--card-border: none`, `--tag-case: none`.

**Don't override individual ladder steps (`--tint-90`, etc.) at `:root`.** The ladder is *recomputed* from the anchor inside every `TINT_CLASS` scope — which includes every component that accepts `color=` or `status=` — so a step override at `:root` only reaches untinted regions and produces inconsistent surfaces. Move the anchor (option 1 or 2) instead, and the steps follow.
