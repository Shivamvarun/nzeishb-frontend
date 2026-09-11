Refactor and organize this Angular project to follow a **modern feature-based architecture**, aligned with current Angular best practices and standalone components.

## Main Goal

Organize the project by **features**, while keeping application-wide functionality inside `core` and reusable functionality inside `shared`.

Do NOT introduce Domain-Driven Design (DDD). The architecture should be **feature-based / feature-first**.

Before making changes:

1. Inspect the existing project structure.
2. Identify all existing pages, components, services, models, interfaces, directives, pipes, helpers, authentication logic, HTTP configuration, and API configuration.
3. Identify files that are no longer used.
4. Check imports/usages before moving or deleting anything.
5. Preserve all existing functionality.
6. Do not make unnecessary functional changes.
7. After restructuring, fix all imports and references.

---

# 1. Core

Create/use:

```text
src/app/core/
├── auth/
├── config/
├── http/
└── helpers/
```

### `core/auth/`

Contains authentication and security-related application-wide logic.

```text
core/auth/
├── auth.service.ts
├── auth.interceptor.ts
├── auth.guard.ts          // only if required
└── ...
```

Examples:

* Login/logout
* Authentication state
* Token/session handling
* Authentication interceptor
* Route guards
* Current-user authentication logic

Do NOT put feature-specific authentication logic here.

---

### `core/config/`

Contains application-wide configuration.

Examples:

```text
core/config/
├── api.config.ts
└── ...
```

API base URLs and other global configuration should be centralized instead of being hardcoded throughout services.

---

### `core/http/`

Contains global HTTP-related configuration.

Examples:

```text
core/http/
├── http.config.ts
└── ...
```

Keep global HTTP configuration and infrastructure here.

Use the modern Angular approach rather than introducing unnecessary legacy `HttpClientModule` patterns.

---

### `core/helpers/`

Contains application-wide helper functions that are not tied to a specific feature.

Only place something here if it is genuinely shared across the application.

Do not move feature-specific utilities here.

---

# 2. Shared

Create/use:

```text
src/app/shared/
├── components/
├── directives/
├── pipes/
└── utils/
```

The `shared` folder contains **reusable, feature-independent code**.

---

## `shared/components/`

Contains reusable UI components used by multiple features.

Example:

```text
shared/components/
├── button/
│   ├── button.component.ts
│   ├── button.component.html
│   └── button.component.scss
│
├── modal/
├── dropdown/
└── ...
```

If a component is only used by one feature, DO NOT put it in `shared`.

Put it inside that feature instead.

For example:

```text
features/planos/components/share-modal/
```

rather than:

```text
shared/components/share-modal/
```

---

## `shared/directives/`

Reusable directives:

```text
shared/directives/
```

Only put directives here if they are generic and reusable across multiple features.

---

## `shared/pipes/`

Reusable pipes:

```text
shared/pipes/
```

Only put generic/reusable pipes here.

---

## `shared/utils/`

Generic reusable utility functions:

```text
shared/utils/
```

Examples:

* Formatting helpers
* Generic transformations
* Generic validation utilities

Do not put business logic here.

---

# 3. Features

All major application functionality should be organized under:

```text
src/app/features/
```

Example:

```text
features/
├── planos/
├── users/
├── analysis/
└── ...
```

Each feature should be self-contained.

---

# 4. Feature structure rule

For every feature, first inspect how complex it is.

### If the feature has only one main page

Do NOT unnecessarily create a `pages` folder.

Example:

```text
features/
└── planos/
    ├── planos.component.ts
    ├── planos.component.html
    ├── planos.component.scss
    ├── componentes/
    ├── services/
    ├── models/
    └── interfaces/
```

Keep the main page directly inside the feature folder.

---

### If the feature contains multiple pages

Create a `pages` folder.

Example:

```text
features/
└── planos/
    ├── pages/
    │   ├── planos/
    │   │   ├── planos.component.ts
    │   │   ├── planos.component.html
    │   │   └── planos.component.scss
    │   │
    │   └── plan-review/
    │       ├── plan-review.component.ts
    │       ├── plan-review.component.html
    │       └── plan-review.component.scss
    │
    ├── components/
    ├── services/
    ├── models/
    └── interfaces/
```

Do not create `pages` simply for the sake of following a template. Use it when the feature actually contains multiple pages.

---

# 5. Feature Components

Feature-specific reusable components should be placed inside:

```text
features/<feature>/components/
```

For example:

```text
features/
└── planos/
    └── components/
        ├── share-modal/
        ├── history-table/
        └── context-selector/
```

These components are related specifically to Planos and should not be placed in `shared`.

---

# 6. Feature Services

Feature-specific services should be placed inside:

```text
features/<feature>/services/
```

Example:

```text
features/
└── planos/
    └── services/
        ├── planos.service.ts
        └── plan-review.service.ts
```

Keep API calls and feature-specific business/data logic here.

If a service is truly application-wide, place it under:

```text
core/services/
```

Do not create a global service folder unnecessarily.

---

# 7. Models

Use:

```text
features/<feature>/models/
```

for feature-specific models.

Example:

```text
features/
└── planos/
    └── models/
        ├── plan.model.ts
        ├── execution.model.ts
        └── history.model.ts
```

Models should represent the application's data/domain objects.

---

# 8. Interfaces

Use:

```text
features/<feature>/interfaces/
```

for feature-specific TypeScript interfaces when separating interfaces from models provides value.

Example:

```text
features/
└── planos/
    └── interfaces/
        ├── plan-response.interface.ts
        ├── plan-request.interface.ts
        └── history-row.interface.ts
```

However, do NOT create duplicate interfaces and models unnecessarily.

If an interface represents a model/data object, prefer keeping it in `models/`.

Use `interfaces/` only when there is a clear reason to distinguish contracts/interfaces from models.

---

# 9. Standalone Components

This project should follow the modern Angular approach.

All components should be **standalone by default**.

Prefer:

```ts
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [...]
})
```

or the appropriate modern Angular syntax/configuration for the Angular version being used.

Remove unnecessary legacy `NgModule` declarations.

Do not create new `NgModule`s unless there is a specific technical requirement.

When migrating existing components:

* Convert components to standalone.
* Move required dependencies into the component's `imports`.
* Remove the component from unnecessary `NgModule` declarations.
* Remove obsolete modules/imports.
* Fix all affected references.
* Preserve existing behavior.

---

# 10. Remove unused files

During the refactoring, identify files that are no longer used.

Before deleting anything:

1. Search the entire project for references/imports.
2. Confirm that the file is not used dynamically.
3. Confirm it is not required by routing/configuration.
4. Delete only genuinely unused files.
5. Remove their unused imports/configuration as well.

Do not delete files based only on their filename.

---

# 11. Naming conventions

Follow consistent Angular naming.

Examples:

```text
planos.component.ts
planos.service.ts
plan.model.ts
plan.interface.ts
auth.service.ts
auth.interceptor.ts
```

Use kebab-case for folders:

```text
plan-review/
share-modal/
history-table/
```

Avoid names such as:

```text
PlanosComponent.ts
ShareModal.ts
```

---

# 12. Target architecture

The final structure should generally look like:

```text
src/app/
│
├── core/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.interceptor.ts
│   │   └── ...
│   │
│   ├── config/
│   │   ├── api.config.ts
│   │   └── ...
│   │
│   ├── http/
│   │   └── ...
│   │
│   └── helpers/
│       └── ...
│
├── shared/
│   ├── components/
│   │   ├── button/
│   │   ├── modal/
│   │   └── ...
│   │
│   ├── directives/
│   ├── pipes/
│   └── utils/
│
├── features/
│   │
│   ├── planos/
│   │   ├── pages/                 # only if multiple pages
│   │   ├── components/
│   │   ├── services/
│   │   ├── models/
│   │   └── interfaces/
│   │
│   ├── users/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── models/
│   │   └── interfaces/
│   │
│   └── analysis/
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── models/
│       └── interfaces/
│
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

# Important rules

* Follow **feature-based architecture**, NOT DDD.
* Prefer feature-local code over global folders.
* `core` = application-wide infrastructure.
* `shared` = reusable generic code.
* `features` = business/application functionality.
* Pages belong to their feature.
* Feature-specific components stay inside the feature.
* Feature-specific services stay inside the feature.
* Feature-specific models/interfaces stay inside the feature.
* Only genuinely reusable components belong in `shared`.
* Authentication/security belongs in `core/auth`.
* Global HTTP infrastructure belongs in `core/http`.
* Global API configuration belongs in `core/config`.
* Use standalone components.
* Remove unnecessary legacy `NgModule` declarations.
* Remove genuinely unused files.
* Do not duplicate models/interfaces unnecessarily.
* Do not change business behavior while restructuring.
* Keep imports clean and remove unused imports.
* Follow the existing Angular version's modern APIs and conventions.
* After completing the refactor, run the project's available type-check/build/test/lint commands and fix issues introduced by the restructuring.

Most importantly: **inspect first, plan the migration, then modify the project. Do not blindly move files based only on filenames.**
