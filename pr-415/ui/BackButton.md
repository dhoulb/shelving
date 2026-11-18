# BackButton

- Kind: component
- Import: `import { BackButton } from "shelving/ui";`

Back button for the current stack.
- Goes back to the page before this one in the current stack, wherever you came from.
- Goes to `href` when the stack has no page before this one: the app was opened at this page, or the browser has no Navigation API.
- It is a plain link with `className="back"`, so it slides back, and it works in a server render and with a middle-click.

The back button for a page header. It goes back to the page before this one in the current stack, wherever you came from.

**Things to know:**

- It goes to the page before this one in the current stack. If you opened a post from a search, it goes back to the search.
- It goes to `href` when the stack has no page before this one: for example, when the app was opened at this page. So a back button always has somewhere to go. Set `href` to the page's natural parent. On an unstacked page (for example a deep link), it goes to `href` and stays unstacked. To go into a stack, the user taps a `<StackButton>`.
- It is a plain link with `className="back"`. `<Navigation>` turns a click into `NavigationStore.back()`, so the page slides back. A middle-click opens the link in a new browser tab.
- Its default content is a `<LeftIcon>` and its default `title` is "Back". Pass `children` and `title` to change them.
- It takes the usual `<Button>` props, except `onClick`.
- Without the browser Navigation API, and in a server render, it links to `href`.
- In a server-rendered app the server always renders `href`, and the browser may render the page before this one. React then warns about a hydration mismatch on the first render. A client-only app (with `<App>`) has no mismatch.

## Usage

```tsx
import { BackButton } from "shelving/ui";

function PostPage({ id }: { id: string }) {
  return (
    <>
      <header>
        <BackButton href="/home"/>
        <h1>Post</h1>
      </header>
      {/* … */}
    </>
  );
}
```

With a label:

```tsx
<BackButton href="/profile">Back to profile</BackButton>
```

To go back to one fixed page (not to the page before), use a link with `className="back"`:

```tsx
<Button href="/profile" className="back">Profile</Button>
```

## Styling

`<BackButton>` renders a `<Button>`, so it has the same styling hooks. See `<Button>`.


## Signatures

```ts
BackButton({ href, className, title = "Back", children = <LeftIcon />, ...props }: BackButtonProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `BackButtonProps` |  |
| `.href` | `AbsolutePath` | Where to go back to when the current stack has no page before this one (for example, the app was opened at this page). Read only. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
