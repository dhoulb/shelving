# NavigationSequence.publish()

- Kind: method
- Member of: `NavigationSequence`

Publish an event by hand, without changing history.
- For example, a swipe-back publishes the page below with `direction: "back"`, so React runs its back transition, and the swipe scrubs it.
- Then the real `back()` publishes the same page again, which `<Navigation>` skips, or the swipe publishes the current page again to cancel.

## Signatures

```ts
publish(event: NavigationEvent): Promise<void>
```
