---
description: 'Use when creating, moving, or refactoring components in the admin app. Covers the three-tier atom/organism pattern, feature folder structure, and rules for where hooks, types, and utils live.'
applyTo: 'src/components/**'
---

# Component Atomization Structure

## Three-Tier Model

| Tier          | Rule                                                                                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primitive** | `components/primitives/ui/` — shadcn components only. Never customized directly; wrap in an atom instead.                                                                                    |
| **Atom**      | `components/atoms/[feature]/[name].tsx` — Pure render. Receives all data as props. No auth, query, or router hooks.                                                                          |
| **Organism**  | `components/organisms/[feature]/[name].tsx` — Owns side effects. May call `useAuthReq`, `useQuery`, navigation hooks, etc. One organism per feature folder calls the hooks; atoms stay pure. |

## Feature Folder Layout

Every cohesive UI feature gets its own folder. No orphaned top-level component files.

```
components/
└── [feature]/
    ├── types.ts         ← all TypeScript types/interfaces for this feature
    ├── utils.ts         ← pure helper functions (no React, no hooks)
    ├── [atom].tsx       ← one file per atomic component
    ├── [organism].tsx   ← one organism that owns hooks and wires atoms together
    └── index.ts         ← barrel: export organism, atoms, and types
```

### Reference implementation: `navigation/`

```
components/navigation/
├── types.ts              ← NavConfig, NavGroup, NavItem, NavSubItem, …
├── utils.ts              ← hasPermissions() — pure, no React
├── nav-sub-item.tsx      ← atom: SidebarMenuSubItem
├── nav-item.tsx          ← atom: SidebarMenuItem (collapsible + leaf)
├── nav-group.tsx         ← atom: SidebarGroup (static + collapsible)
├── nav-builder.tsx       ← organism: calls useAuthReq, maps config → atoms
└── index.ts              ← barrel export
```

## Rules

### Atoms

- Accept all dynamic data as **props** — never reach for a context or hook directly.
- Are fully **testable in isolation** without mocking auth or routing.
- Use `Array<T>` syntax (not `T[]`) to satisfy the project lint rules.

### Organisms

- **One organism per feature** calls context/query hooks.
- Reads auth state once (e.g. `useAuthReq`) and passes it down as props.
- Named after what they represent, not where they render (e.g. `NavBuilder`, not `SidebarNav`).

### `hooks/` directory

- Only for **cross-cutting hooks** that are reused across multiple features (e.g. `use-mobile`).
- Feature-specific hooks live inside their feature folder (e.g. `navigation/use-nav-state.ts`).

### `routes/` directory

- Route files **orchestrate** organisms but do not define reusable UI.
- Keep route files thin: load data, pick an organism, render it.

### Barrel (`index.ts`)

Every feature folder must export via `index.ts`:

```ts
export { MyOrganism } from './my-organism' // default import path for consumers
export { MyAtom } from './my-atom' // available for custom compositions
export type { MyType, MyConfig } from './types' // all public types
```

## `sidebar/` Feature Folder

Consolidate sidebar-level components here (not in `components/` root):

```
components/sidebar/
├── sidebar-header.tsx   ← atom: branding/logo area
├── nav-user.tsx         ← atom: receives { name, email, avatar } as props
├── app-sidebar.tsx      ← organism: calls useAuthReq, assembles the full sidebar
└── index.ts
```

## Naming Conventions

| Pattern                          | Example                                              |
| -------------------------------- | ---------------------------------------------------- |
| Atoms — descriptive noun         | `nav-item.tsx`, `nav-user.tsx`, `sidebar-header.tsx` |
| Organisms — verb+noun or builder | `nav-builder.tsx`, `app-sidebar.tsx`                 |
| Renderer atoms (shadcn wrappers) | `nav-group.tsx` → export `NavGroupRenderer`          |
| Types file                       | always `types.ts`                                    |
| Utils file                       | always `*.utils.ts`                                  |

## Custom Usage

Every component must be declared as const, unless it needs to be a function due to high-order components like `forwardRef`. Use FC type, and PropsWithChildren if it has children:

```ts
import type { FC, PropsWithChildren } from 'react'

export const MyComponent: FC<PropsWithChildren<MyProps>> = ({ children, ...props }) => {
  return <div {...props}>{children}</div>
}
```

Components must be exported as named exports, never default exports. This allows for better tree-shaking and easier refactoring.

Components should be split into smaller components if they are too large or have multiple responsibilities. Each component should have a single responsibility and be easy to understand in isolation.
