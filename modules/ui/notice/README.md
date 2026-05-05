# Notices

## Basic notices

Basic notices appear inside code:

```.tsx
<div>
This is some content.
<Notice>This is a notice<Notice>
This is some more content.
</div>
```

Basic notices can use any of the status classes (see the `Status` type in `Status.tsx`):


```.tsx
<Notice status="error">This is an error.<Notice>
<Notice status="success">This is a success!<Notice>
```


## Global notices

Global notices are powered by the `Notices` module and the global notices context. To show a notice in the global context use the `requireNotices()` function:

```.tsx
function MyComponent() {
	const notices = requireNotices();
	return <button type="button" onClick={() => notices.success("Good thing happened!")}>Good thing</button>;
	return <button type="button" onClick={() => notices.error("Bad thing happened!")}>Bad thing</button>;
}
```

Use the `<Notices>` component somewhere in your app to output the global notices at that point.

## Forms and buttons

Forms and buttons are already wired to use global notices. Callbacks to `<Form onSubmit={callback}>` and `<Button onClick={callback}>` can return `string` or a Shelving `Feedback` instance, in order to show a success notice, or throw a `etring` or `Feedback` instance