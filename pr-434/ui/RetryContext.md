# RetryContext

- Kind: constant
- Import: `import { RetryContext } from "shelving/ui";`

Context for providing a "retry" callback to descendant `<RetryButton>` elements.
- Used by `<Catcher>` to provide a retry callback to its children.
- Default `<ErrorNotice>` and `<ErrorPage>` elements include `<RetryButton>` to trigger a retry on their parent `<Catcher>`
