# TreeContext

- Kind: constant
- Import: `import { TreeContext } from "shelving/ui";`

React context holding a flattened `key` → `element` map of the surrounding tree(s).

- Keyed by flat name (`"BooleanSchema"`, `"Class.member"`) and canonical path (`"/schema/BooleanSchema"`) for fast cross-reference lookup.
