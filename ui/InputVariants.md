# InputVariants

- Kind: interface
- Import: `import { InputVariants } from "shelving/ui";`
- Extends: `BlockVariants`

Styling variants shared by every form input — the block variants: `space`, `padding`, `indent`, `width`, and typography.
- Any input can be spaced and sized like a block (e.g. `<TextInput space="none">`, `<CheckboxInput width="fit">`).
- Designed to grow: new cross-cutting input styling props should be added here so every input picks them up consistently.

## Signatures

```ts
{}
```
