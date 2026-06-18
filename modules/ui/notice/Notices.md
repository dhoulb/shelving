# Notices

Renders the global list of active notices and subscribes to incoming `"notice"` events. It listens for `"notice"` events on `window` (dispatched by the [`notify`](/ui/notify) helpers) and shows each one as a [`<Notice>`](/ui/Notice) — this is how components like [`<Button>`](/ui/Button) and [`<FormNotify>`](/ui/FormNotify) send notices into the global list.

**Things to know:**

- Mount `<Notices>` once near the root of your app. It renders at that point in the DOM and listens automatically — no context required.
- Notices auto-dismiss after a short delay unless they carry a `"loading"` status.
- Backed by the [`NOTICES`](/ui/NOTICES) store singleton; for advanced use you can keep a reference to a notice to update or close it manually.

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
