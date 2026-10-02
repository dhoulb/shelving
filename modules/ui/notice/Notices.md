# Notices

Renders the global list of active notices and subscribes to incoming `"notice"` events. It listens for `"notice"` events on `window` (dispatched by the `notify()` helpers) and shows each one as a `<Notice>` — this is how components like `<Button>` and `<FormNotify>` send notices into the global list.

**Things to know:**

- Mount `<Notices>` once near the root of your app. It renders at that point in the DOM and listens automatically — no context required.
- Notices auto-dismiss after a short delay unless they carry a `"loading"` status.
- Backed by the `NOTICES` store singleton; for advanced use you can keep a reference to a notice to update or close it manually.
- Notices animate with [view transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API). A new notice slides in from the right, and a closed notice slides out to the right. The other notices move to their new places. A notice that changes in place cross-fades.
- With reduced motion, notices fade in and out in place, and the others move at once. A browser without view transitions shows the changes at once.

## Usage

Mount once near the root of your app:

```tsx
import { Notices } from "shelving/ui";

export function AppLayout({ children }) {
  return (
    <>
      {children}
      <Notices />
    </>
  );
}
```

Dispatch notices from anywhere — no context required:

```tsx
import { notifySuccess, notifyError, callNotified } from "shelving/ui";

notifySuccess("Profile updated.");
notifyError("Could not connect.");

// Wrap an async callback — dispatches success or error automatically.
callNotified(async () => {
  await saveProfile(data);
  return "Profile updated.";
});
```

Programmatic control via the `NOTICES` singleton:

```tsx
import { NOTICES } from "shelving/ui";

// Show a loading notice and hold a reference to it.
const notice = NOTICES.show(undefined, "loading");
await uploadFile(file);
notice.show("Upload complete.", "success"); // Update in place.
notice.close(); // Or close it immediately.
```

## Styling

`Notices` positions the list in the bottom-right corner. Each item is a `<Notice>`, which has its own hooks. Override these hooks at `:root` (or any ancestor scope) to retheme.

| Variable | Styles | Default |
|---|---|---|
| `--notices-offset` | Distance of the list from the bottom and right edges | `var(--space-normal)` (16px) |
| `--notices-width` | Maximum width of the list | `var(--width-narrow)` |
| `--notices-gap` | Gap between notices | `var(--space-small)` (12px) |
| `--notices-transition-duration` | Length of the slide in, slide out, and move | `var(--duration-fast)` (150ms) |

**Global tokens it reads** — move these to retheme broadly: `--space-normal`, `--space-small`, `--width-narrow`, and `--duration-fast`.
