# Notices

Renders the global list of active notices and subscribes to incoming `"notice"` events. It listens for `"notice"` events on `window` (dispatched by the `notify()` helpers) and shows each one as a `<Notice>` — this is how components like `<Button>` and `<FormNotify>` send notices into the global list.

**Things to know:**

- Mount `<Notices>` once near the root of your app. It renders at that point in the DOM and listens automatically — no context required.
- Notices auto-dismiss after a short delay unless they carry a `"loading"` status.
- Backed by the `NOTICES` store singleton; for advanced use you can keep a reference to a notice to update or close it manually.
- The list shows in the bottom-right corner. Set `position` to `"top-left"`, `"top-right"`, `"bottom-left"`, or `"bottom-right"` to choose a different corner.
- Notices animate with [view transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API). A new notice slides in from the side of its corner, and a closed notice slides out to that side. The other notices move to their new places. A notice that changes in place (for example from loading to success) changes at once, with no animation.
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

Show the list in the top-left corner:

```tsx
<Notices position="top-left" />
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

`Notices` positions the list in the corner that `position` sets. Each notice is only as wide as its content and is aligned to the side of that corner. The list is never wider than `--notices-width`, and keeps `--notices-offset` clear at both sides on a narrow screen. The offset also adds the safe area of the device (`env(safe-area-inset-*)`). Clicks pass through the gaps between notices to the page. Each item is a `<Notice>`, which has its own hooks. Override these hooks at `:root` (or any ancestor scope) to retheme.

| Variable | Styles | Default |
|---|---|---|
| `--notices-offset` | Distance of the list from the top or bottom edge, and from the left and right edges | `var(--space-normal)` (16px) |
| `--notices-width` | Maximum width of the list and of each notice | `var(--width-narrow)` |
| `--notices-shadow` | Drop shadow under each notice in the list (sets `--notice-shadow`) | `var(--shadow-small)` |
| `--notices-gap` | Gap between notices | `var(--space-small)` (12px) |
| `--notices-transition-duration` | Length of the slide in, slide out, and move | `var(--duration-fast)` (150ms) |

**Global tokens it reads** — move these to retheme broadly: `--space-normal`, `--space-small`, `--shadow-small`, `--width-narrow`, and `--duration-fast`.
