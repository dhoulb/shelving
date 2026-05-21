# Notices

Inline and global toast-style notices for user feedback. `<Notice>` is a standalone status banner; `<Notices>` is the global list that listens for dispatched events and shows them automatically.

## Concepts

**`<Notice>`** renders an `<aside>` with a status icon and a message. It accepts a `status` prop (`"info"`, `"success"`, `"error"`, `"danger"`, `"loading"`, etc.) and maps it to the appropriate colour and ARIA role. The icon defaults to `<StatusIcon>` but can be replaced or hidden.

**`<NoticeCard>`** is the chunky variant — the box treatment of a `Card` combined with the status styling of a `Notice`. It lays its icon and content out in a centered column, with a large status icon by default, and a regular-size `<Button>` sits comfortably inside. Use it for a prominent standalone message (e.g. a full-page "not found" or error state) where an inline `<Notice>` reads too quietly.

**`<Message>`** is a lighter variant — a `<p>` tag with the same status colours, for short inline feedback inside a form or card rather than a banner.

**`<Notices>`** renders the global list of active notices. It subscribes to `"notice"` events on `window` (dispatched by the `notify` helpers in [ui/util](/ui/util)) and shows each one as a `<Notice>`. Notices auto-dismiss after 5 seconds unless they carry a `"loading"` status.

**`NoticeStore` and `NoticesStore`** are the reactive stores behind `<Notices>`. `NoticesStore` is an `ArrayStore<NoticeStore>` that manages the list. Each `NoticeStore` is a `DataStore` holding one notice's message and status, and removes itself from the list when it closes.

## Basic usage

Place `<Notice>` anywhere to show inline status feedback.

```tsx
import { Notice } from "shelving/ui";

<Notice status="success">Your changes have been saved.</Notice>
<Notice status="error">Something went wrong.</Notice>
<Notice status="loading" />
```

When `status` is omitted, `<Notice>` defaults to `"info"` if `children` is present, or `"loading"` if not.

Use `<NoticeCard>` for a prominent, full-attention message — it centers its content and carries a regular-size button.

```tsx
import { NoticeCard } from "shelving/ui";

<NoticeCard status="error">
  Page not found.
  <Button onClick={retry}>Retry</Button>
</NoticeCard>
```

Use `<Message>` for shorter inline feedback inside paragraphs or forms.

```tsx
import { Message } from "shelving/ui";

<Message status="error">This field is required.</Message>
```

## Global notices

Mount `<Notices>` once near the root of your app. It renders at that point in the DOM and listens automatically.

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

// Direct dispatch.
notifySuccess("Profile updated.");
notifyError("Could not connect.");

// Wrap an async callback — dispatches success or error automatically.
callNotified(async () => {
  await saveProfile(data);
  return "Profile updated.";
});
```

## Programmatic control via `NoticesStore`

The global `NOTICES` singleton is exported for advanced use — for example, keeping a reference to a specific notice so you can update or close it manually.

```tsx
import { NOTICES } from "shelving/ui";

// Show a loading notice and hold a reference to it.
const notice = NOTICES.show(undefined, "loading");

await uploadFile(file);

// Update the same notice in place.
notice.show("Upload complete.", "success");

// Or close it immediately.
notice.close();
```

`NoticeStore` implements `AsyncDisposable`, so it can be used in an `await using` block to close automatically when the scope exits.

## See also

- [ui/util](/ui/util) — `notify`, `notifySuccess`, `notifyError`, `callNotified`, and `subscribeNotices`
- [store](/store) — `ArrayStore` and `DataStore` that `NoticesStore` and `NoticeStore` extend
