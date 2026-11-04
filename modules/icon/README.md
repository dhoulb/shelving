# icon

The default icons that `shelving/ui` components draw, one icon per module. `ui` imports each icon by its public path, so it is a separate module. Each module re-exports a Heroicon. Your app can swap any of them for its own icon.

Components import each icon from its public path, for example `shelving/icon/CloseIcon`, not from Heroicons. There is no `shelving/icon` barrel: import each icon by its own path. So one `paths` entry in your app's `tsconfig.json` changes the icon everywhere it is used.

## Swap an icon

Make a module that exports a component with the same name, then point the path at it:

```json
{
	"compilerOptions": {
		"paths": {
			"shelving/icon/CloseIcon": ["./icons/CloseIcon.tsx"]
		}
	}
}
```

```tsx
// icons/CloseIcon.tsx
export function CloseIcon(props: SVGProps<SVGSVGElement>) {
	return <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" {...props}>…</svg>;
}
```

**Things to know:**

- Bun applies your app's `tsconfig.json` `paths` to imports inside `node_modules` too: in `bun build`, the Bun dev server, `bun test`, and the Bun runtime. TypeScript also reads the types from your module.
- The default icon is not imported, so it is not in your bundle.
- The module can export other things too, so one `index.tsx` of icons can serve as the target of many paths.
- Other bundlers need their own alias, for example `resolve.alias` in Vite or webpack.
- Give the `<svg>` the attribute `data-slot="icon"`, the same as a Heroicon, so shelving's CSS sizes it.
- If your app does not map an icon, it gets the default.

## Icons

| Module | Default Heroicon | Used in |
|---|---|---|
| `CloseIcon` | `XMarkIcon` | `<Dialog>`, `<SidebarLayout>`, `<ImageInput>`, `<ArrayInput>`, `<DictionaryInput>` |
| `AddIcon` | `PlusIcon` | `<ArrayInput>`, `<DictionaryInput>` |
| `MenuIcon` | `Bars3Icon` | `<SidebarLayout>` |
| `UpIcon` | `ChevronUpIcon` | `<Details>` |
| `RightIcon` | `ChevronRightIcon` | `<TreeBreadcrumbs>` |
| `FullscreenIcon` | `ArrowsPointingOutIcon` | `<FullscreenButton>` |
| `ExitFullscreenIcon` | `ArrowsPointingInIcon` | `<FullscreenButton>` |
| `SubmitIcon` | `ArrowRightIcon` | `<SubmitButton>` |
| `RetryIcon` | `ArrowPathIcon` | `<RetryButton>` |
| `SuccessIcon` | `CheckCircleIcon` | `<Icon status="success">` |
| `ErrorIcon` | `XCircleIcon` | `<Icon status="error">` |
| `WarningIcon` | `ExclamationTriangleIcon` | `<Icon status="warning">`, `<Icon status="danger">` |
| `InfoIcon` | `InformationCircleIcon` | `<Icon>` (the default status) |
