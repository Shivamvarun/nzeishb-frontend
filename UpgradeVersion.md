# Angular 17 to Angular 22 — Technical Upgrade Justification

## 1. Purpose

This document explains the technical and business justification for upgrading the application from **Angular 17 to Angular 22**.

The purpose of this upgrade is not simply to move to a newer framework version. The objective is to bring the application onto a **currently supported, maintainable, modern Angular foundation** that is compatible with the current Node.js and TypeScript ecosystem and provides a stable platform for future development.

The document covers:

* Why the application needs to move away from Angular 17.
* Why Angular 22 is selected as the target version.
* Why the application should not stop at Angular 18, 19, 20, or 21.
* Angular, Node.js, and TypeScript compatibility.
* Dependency compatibility.
* Modern Angular architecture.
* New concepts and capabilities available in Angular 22.
* Build-system modernization.
* Performance and developer-experience improvements.
* Migration strategy.
* Future modernization opportunities.
* Risks of remaining on an older Angular version.

---

# 2. Executive Summary

The application was originally based on **Angular 17** and has since moved through the Angular upgrade path toward **Angular 22**.

Angular is released continuously, and each major version has its own compatibility requirements and support lifecycle.

Remaining on Angular 17 would leave the application on an unsupported framework version and increasingly constrain the versions of:

* Node.js
* TypeScript
* Angular CLI
* Angular build tooling
* Angular ecosystem libraries
* Third-party packages

Angular 22 provides a modern supported baseline and aligns the application with the current JavaScript/TypeScript ecosystem.

The upgrade therefore provides both an **immediate technical benefit** and a **long-term maintenance benefit**.

The target architecture is:

```text
Angular 17
    ↓
Intermediate Angular versions
    ↓
Angular 21
    ↓
Angular 22
    ↓
Modern Angular foundation
```

The objective is not to rewrite the application during the upgrade. Instead, the framework is first brought to Angular 22 and stabilized. Modern Angular concepts can then be adopted incrementally.

---

# 3. Current and Target Environment

| Technology    |             Previous Environment | Target Environment |
| ------------- | -------------------------------: | -----------------: |
| Angular       |                             17.x |               22.x |
| Angular CLI   |                             17.x |               22.x |
| Angular Core  |                             17.x |               22.x |
| Angular Build |                             17.x |               22.x |
| TypeScript    | Older Angular-compatible version |              6.0.x |
| Node.js       |            Older supported range |               24.x |
| RxJS          |                              7.x |                7.x |
| ngx-markdown  | Older Angular-compatible version |               22.x |

The application is therefore moving toward a modern and supported combination of:

```text
Angular 22
Node.js 24
TypeScript 6
RxJS 7
```

Angular's official compatibility matrix defines which Node.js, TypeScript, and RxJS versions are supported by each Angular release.

---

# 4. Why Angular 17 Needs to Be Upgraded

## 4.1 Angular 17 is no longer a suitable long-term baseline

Angular follows a defined release lifecycle consisting of active support followed by long-term support.

Angular 17 is outside the currently supported Angular release lifecycle.

Using an unsupported framework creates long-term technical and maintenance risks.

These include:

* No current framework support.
* Reduced access to framework fixes.
* Increasing dependency incompatibility.
* Difficulty adopting current Angular libraries.
* Older Node.js compatibility requirements.
* Older TypeScript compatibility requirements.
* Increasing technical debt.
* Larger migration effort in the future.

Therefore, staying on Angular 17 is not a sustainable long-term strategy.

Angular's release and support policy can be referenced in the official Angular release documentation.

---

# 5. Why Not Stop at Angular 18?

One possible approach would be:

```text
Angular 17 → Angular 18
```

However, Angular 18 is also no longer a suitable long-term target.

Stopping at Angular 18 would mean performing an upgrade only to immediately remain on an older framework baseline.

This would provide some improvements over Angular 17 but would not solve the fundamental objective of moving the application onto the current supported Angular ecosystem.

It would also mean:

* Another major upgrade would soon be required.
* The project would still be behind the current Angular release.
* Newer dependency versions may still require additional upgrades.
* The team would continue carrying framework-related technical debt.

Therefore, Angular 18 is not the appropriate final target.

---

# 6. Why Not Stop at Angular 19?

Angular 19 introduced and matured several modern Angular capabilities, including further adoption of Signals and standalone application patterns.

However, Angular 19 is also no longer the preferred long-term baseline.

Stopping at Angular 19 would have the same fundamental problem:

```text
17 → 19
       ↓
still behind current Angular
       ↓
another upgrade required
```

From a project-maintenance perspective, it is more efficient to move to a currently supported target instead of intentionally stopping at an older major version.

---

# 7. Why Not Stop at Angular 20?

Angular 20 was a significant modern Angular release and introduced further improvements to:

* Signals.
* Developer tooling.
* Performance.
* Modern Angular APIs.
* Build and development workflows.

However, Angular 20 is still an intermediate release relative to the current Angular 22 target.

Choosing Angular 20 would therefore provide only a temporary solution.

The project would still require another major-version upgrade to reach the desired current baseline.

The goal of this project is not:

```text
"Upgrade Angular by one or two versions."
```

The goal is:

```text
"Bring the application to a current, supported Angular foundation."
```

Angular 22 satisfies that objective more effectively.

---

# 8. Why Not Stop at Angular 21?

This is particularly relevant because the application reached Angular 21 during the migration process.

Angular 21 was a valid intermediate step and provided a clean upgrade path toward Angular 22.

However, Angular 21 should not be considered the final target for this project.

The main reasons are:

### 8.1 Angular 22 is the newer supported baseline

Angular 22 provides the latest framework APIs and improvements available within the selected target timeframe.

### 8.2 Node.js compatibility

The current development environment uses Node.js 24.x.

Angular 22 explicitly supports modern Node.js versions, including Node.js 24.x, according to Angular's compatibility matrix.

### 8.3 TypeScript compatibility

Angular 22 supports TypeScript 6.0.x.

This provides access to a more current TypeScript ecosystem compared with Angular 21's TypeScript compatibility range.

### 8.4 Current dependency ecosystem

Third-party Angular packages progressively update their peer dependencies to support newer Angular releases.

For example, the project required:

```text
ngx-markdown 21.x
        ↓
Angular 21

ngx-markdown 22.x
        ↓
Angular 22
```

Moving to Angular 22 allows the project to use the corresponding current versions of Angular-compatible libraries rather than keeping the project tied to older releases.

### 8.5 Avoiding another immediate major upgrade

Stopping at Angular 21 would result in:

```text
Angular 17
    ↓
Angular 21
    ↓
Angular 22 shortly afterwards
```

Since the application is already being migrated and the target is Angular 22, completing the migration avoids intentionally creating another major-version upgrade requirement.

---

# 9. Why Angular 22 Is the Appropriate Target

Angular 22 provides the best balance between:

* Current framework support.
* Modern Node.js compatibility.
* Modern TypeScript compatibility.
* Current Angular CLI.
* Modern build tooling.
* Modern Angular APIs.
* Third-party library compatibility.
* Long-term maintainability.
* Future modernization opportunities.

The target is therefore:

```text
Angular 22
    +
Node.js 24
    +
TypeScript 6
    +
Current Angular ecosystem
```

This creates a modern foundation on which future application development can continue.

---

# 10. Node.js Compatibility

Angular and Node.js versions are closely related.

Angular 17 supported an older Node.js range, while Angular 22 supports modern Node.js versions.

Angular 22 supports:

```text
Node.js 22.22.3+
Node.js 24.15.0+
Node.js 26.x
```

within the supported version ranges defined by Angular.

The project's current Node.js version is:

```text
Node.js 24.x
```

which fits within Angular 22's supported Node.js range.

## Why this is important

Using supported Node.js and Angular combinations helps prevent:

* CLI compatibility issues.
* Build failures.
* Package installation problems.
* Unsupported runtime combinations.
* Dependency resolution problems.
* Development-environment inconsistencies.

The Angular version should therefore be considered together with the Node.js version rather than independently.

---

# 11. TypeScript Compatibility

Angular has a defined TypeScript compatibility range for each major release.

Angular 22 supports:

```text
TypeScript >= 6.0.0 < 6.1.0
```

according to the official Angular compatibility matrix.

Moving to Angular 22 therefore allows the application to align with the current TypeScript ecosystem.

## Benefits

Modern TypeScript provides:

* Stronger static typing.
* Improved type inference.
* Better IDE support.
* Better compiler diagnostics.
* Support for modern language features.
* Improved developer productivity.

This is important because Angular applications depend heavily on TypeScript.

---

# 12. Angular CLI Upgrade

The Angular CLI is an important part of the Angular development ecosystem.

The upgrade includes moving the CLI to the corresponding Angular 22 version.

This provides:

* Current project-generation capabilities.
* Current development server.
* Current build tooling.
* Angular migration tooling.
* Better compatibility with Angular 22.
* Access to modern CLI commands and configuration.

Angular recommends using the Angular CLI's update mechanism for major-version upgrades.

---

# 13. Modern Angular Build System

One of the important changes introduced during the migration is the move toward Angular's modern application build system.

Modern Angular uses updated build tooling and Vite-based development workflows.

The modern build system provides opportunities for:

* Improved build performance.
* Faster development workflows.
* Modern dependency handling.
* Improved development server behavior.
* Better integration with current web tooling.

The Angular CLI provides migration support for moving existing applications to the newer application builder.

---

# 14. Vite-Based Development

Modern Angular development tooling uses Vite as part of the development workflow.

This provides a modern approach to:

* Module handling.
* Development server operation.
* Dependency processing.
* Hot updates during development.

This is an important modernization compared with the older Angular build architecture.

The migration therefore modernizes not only the Angular framework but also the tooling used to develop and build the application.

---

# 15. Standalone Architecture

Angular has moved toward standalone components and away from requiring `NgModule` for every component structure.

Traditional architecture commonly uses:

```text
Component
    ↓
NgModule
    ↓
Application
```

Modern Angular can use:

```text
Standalone Component
        ↓
Application
```

Standalone components can declare their dependencies directly.

## Benefits

* Less boilerplate.
* Easier dependency management.
* Better component reuse.
* Easier lazy loading.
* Simpler application structure.
* Easier future modernization.

Angular provides official migrations to help applications adopt standalone APIs incrementally.

### Important

The Angular 17 → 22 upgrade does **not** require converting the entire application to standalone immediately.

Standalone migration can be performed separately and incrementally.

---

# 16. Signals

Signals are one of the most important concepts in modern Angular.

A Signal represents reactive state.

Example:

```ts
isLoading = signal(false);
```

The value can be changed through:

```ts
isLoading.set(true);
```

and consumed reactively in templates.

Signals provide Angular with more explicit information about application state and dependencies.

## Benefits

* Fine-grained reactivity.
* Clearer state management.
* Better reactive programming model.
* Better integration with modern Angular APIs.
* Opportunities for more efficient change detection.

Angular's current ecosystem is increasingly based around Signals.

---

# 17. Signal Inputs

Modern Angular provides signal-based component inputs.

Traditional:

```ts
@Input() value!: string;
```

Modern:

```ts
value = input<string>();
```

This creates a component input that integrates directly with Angular's signal-based reactivity model.

This is particularly useful when building new components or modernizing existing component APIs.

---

# 18. Model Inputs

Angular also provides the `model()` API for components that need two-way binding.

Example:

```ts
value = model<string>();
```

This provides a cleaner modern API for component state that needs to be both received from and updated by a parent component.

It provides a modern alternative to manually combining:

```text
@Input()
+
@Output()
+
valueChange
```

This is particularly useful for reusable components.

---

# 19. Built-in Control Flow

Modern Angular provides built-in template control flow.

Instead of:

```html
<div *ngIf="isVisible">
```

applications can use:

```html
@if (isVisible) {
  <div>...</div>
}
```

Instead of:

```html
<div *ngFor="let user of users">
```

modern Angular supports:

```html
@for (user of users; track user.id) {
  <div>{{ user.name }}</div>
}
```

## Benefits

* Cleaner templates.
* Better readability.
* Better type checking.
* Modern Angular syntax.
* Reduced reliance on structural directives.

This capability was introduced beginning with Angular 17 and is now part of the modern Angular programming model.

---

# 20. Deferred Loading with `@defer`

Angular provides deferred views:

```html
@defer {
  <heavy-component />
}
```

This allows expensive UI to be loaded later rather than being part of the initial application workload.

This can be particularly useful for applications containing:

* BIM viewers.
* Large charts.
* Maps.
* Visualization components.
* Rich editors.
* Heavy analysis components.

## Benefits

* Reduced initial JavaScript workload.
* Faster initial rendering.
* Better application startup performance.
* Better control over when expensive components are loaded.

---

# 21. Zoneless Change Detection

Angular traditionally uses ZoneJS to help detect asynchronous activity.

Modern Angular provides a path toward zoneless change detection.

Instead of relying heavily on ZoneJS, Angular can use explicit reactive signals and other Angular notifications to determine when UI updates are required.

Potential benefits include:

* Reduced framework overhead.
* Improved performance opportunities.
* Better debugging.
* Better alignment with signal-based applications.
* Less reliance on ZoneJS.

Angular currently identifies zoneless change detection as a production-ready capability.

### Important

The application does not need to become zoneless as part of the initial Angular 22 upgrade.

It can be evaluated as a separate optimization.

---

# 22. Signal Forms

Modern Angular also provides Signal Forms.

Signal Forms provide a signal-based approach to form state.

Potential benefits include:

* Reactive form state.
* Type-safe form fields.
* Signal-based validation.
* Reduced synchronization code.
* Better integration with the Signal ecosystem.

Signal Forms can be evaluated for new functionality or future form modernization.

Existing Reactive Forms do not need to be rewritten immediately.

---

# 23. Resource APIs

Modern Angular provides APIs for handling asynchronous data in a reactive way, including:

```text
resource()
httpResource()
```

These APIs provide a signal-oriented approach to asynchronous operations.

They can help manage:

* Loading state.
* Data state.
* Error state.
* Reactive asynchronous operations.

This provides another modernization opportunity for future development.

---

# 24. Improved Performance Opportunities

Angular 22 provides multiple mechanisms that can be used to improve application performance.

These include:

### Signals

Fine-grained reactive state.

### `@defer`

Deferred loading of expensive UI.

### Modern build system

Improved application build and development workflow.

### Standalone architecture

Simpler lazy-loaded application structures.

### Zoneless

Potentially lower change-detection overhead.

These features provide opportunities to optimize the application without requiring all existing code to be rewritten.

---

# 25. Improved Developer Experience

The upgrade also improves the development environment.

Benefits include:

* Modern Angular CLI.
* Modern compiler.
* Modern TypeScript.
* Modern build system.
* Better template diagnostics.
* Modern reactive APIs.
* Better component APIs.
* Improved development server.
* Better tooling for future Angular development.

This reduces the amount of legacy Angular knowledge required for future development.

---

# 26. Testing Modernization

Modern Angular is moving toward newer testing tooling, including Vitest.

The Angular CLI provides a migration path from the legacy Karma-based testing setup.

However, testing migration should ideally be treated separately from the framework upgrade.

Recommended approach:

```text
Phase 1

Angular 17
    ↓
Angular 22
    ↓
Build stable
    ↓
Tests stable
```

Then:

```text
Phase 2

Karma
    ↓
Vitest
```

This separation keeps the Angular upgrade focused and makes failures easier to diagnose.

---

# 27. Third-Party Dependency Compatibility

Angular applications depend on many external libraries.

Examples include:

```text
ngx-markdown
Three.js
Chart.js
Leaflet
Web-IFC
RxJS
```

These libraries have their own Angular and TypeScript compatibility requirements.

As Angular moves to newer versions, third-party packages may also release corresponding versions.

For example:

```text
Angular 21
    ↓
ngx-markdown 21.x
```

and:

```text
Angular 22
    ↓
ngx-markdown 22.x
```

The upgrade therefore allows the application to remain aligned with actively maintained versions of its Angular ecosystem dependencies.

---

# 28. Peer Dependency Compatibility

Angular packages frequently specify peer dependencies.

For example:

```text
ngx-markdown
    ↓
requires compatible Angular version
```

If the project uses:

```text
Angular 22
+
ngx-markdown 21
```

the package manager may report an incompatible peer dependency.

The correct solution is to use a version of the dependency that supports Angular 22.

This is why framework upgrades should always include a review of third-party dependency compatibility.

---

# 29. Security and Maintainability

A supported framework version provides a stronger foundation for long-term application maintenance.

Using a current Angular version helps the project:

* Receive framework updates.
* Adopt supported dependencies.
* Maintain compatibility with modern tooling.
* Reduce accumulated technical debt.
* Make future maintenance easier.

Security should not be considered only as a framework feature.

Maintaining supported dependencies is part of the application's overall security and maintenance strategy.

---

# 30. Future Upgrade Strategy

One of the important advantages of moving to Angular 22 now is that future upgrades can be smaller.

Instead of allowing the application to remain on an old version for many years:

```text
Angular 17
        ↓
large migration
        ↓
Angular 22
```

the project can follow:

```text
Angular 22
    ↓
Regular Angular updates
    ↓
Smaller migrations
    ↓
Lower upgrade risk
```

Regular upgrades are generally easier to manage than large multi-year framework migrations.

---

# 31. Framework Upgrade vs Application Modernization

These should be considered two different activities.

## Framework Upgrade

The immediate objective is:

```text
Angular 17 → Angular 22
```

The focus is:

* Compatibility.
* Build stability.
* Dependency updates.
* TypeScript compatibility.
* Node.js compatibility.
* Framework support.

## Application Modernization

After the upgrade is stable, the application can progressively adopt:

```text
NgModules
      ↓
Standalone

Traditional component state
      ↓
Signals

*ngIf / *ngFor
      ↓
@if / @for

ZoneJS-based detection
      ↓
Zoneless

Traditional form patterns
      ↓
Signal Forms where appropriate

Karma
      ↓
Vitest
```

This separation reduces migration risk.

---

# 32. Why the Upgrade Should Be Completed Now

The upgrade is especially valuable because the application is already undergoing dependency and environment modernization.

The project has already moved toward:

```text
Angular 21
    ↓
Angular 22
```

and dependencies such as `ngx-markdown` have corresponding Angular 22 versions.

Completing the upgrade now avoids maintaining two different technical baselines.

Instead of:

```text
Angular 21
    +
Older ecosystem dependencies
    +
Future Angular 22 migration
```

the project can move to:

```text
Angular 22
    +
Compatible dependencies
    +
Modern Node.js
    +
Modern TypeScript
```

This provides a cleaner baseline for future development.

---

# 33. Benefits Summary

| Category         | Benefit                                         |
| ---------------- | ----------------------------------------------- |
| Support          | Current supported Angular baseline              |
| Security         | Easier maintenance of supported dependencies    |
| Node.js          | Compatibility with modern Node.js               |
| TypeScript       | Access to TypeScript 6.0.x                      |
| CLI              | Current Angular CLI                             |
| Build            | Modern application builder                      |
| Development      | Modern Vite-based workflow                      |
| Architecture     | Standalone component support                    |
| Reactivity       | Signals                                         |
| Components       | Signal inputs and model inputs                  |
| Templates        | Built-in control flow                           |
| Performance      | `@defer`, Signals, modern build tooling         |
| Change Detection | Zoneless capability                             |
| Forms            | Signal Forms                                    |
| Async APIs       | Resource APIs                                   |
| Testing          | Migration path toward Vitest                    |
| Dependencies     | Better alignment with current Angular libraries |
| Maintenance      | Reduced technical debt                          |
| Future upgrades  | Easier incremental upgrades                     |

---

# 34. Risk of Not Upgrading

If the application remains on Angular 17, the following risks increase over time:

```text
Unsupported Angular
        ↓
Older Node.js requirements
        ↓
Older TypeScript requirements
        ↓
Third-party dependency incompatibility
        ↓
Increasing technical debt
        ↓
Larger future migration
```

The longer the application remains on an unsupported major version, the more difficult it can become to bring the entire ecosystem back into compatibility.

---

# 35. Recommended Target

The recommended target is:

```text
┌───────────────────────────────┐
│         Angular 22            │
├───────────────────────────────┤
│ Angular CLI 22                │
│ Angular Core 22               │
│ Angular Build 22              │
│ TypeScript 6.0.x              │
│ Node.js 24.x                  │
│ RxJS 7.x                      │
│ Compatible third-party libs   │
└───────────────────────────────┘
```

This provides the project with a modern, supported baseline.

---

# 36. Migration Approach

The recommended migration approach is:

### Step 1 — Establish a clean baseline

Verify the existing Angular application and dependencies.

### Step 2 — Upgrade Angular

Move:

```text
Angular 17 → Angular 22
```

using Angular's official migration tooling.

### Step 3 — Resolve dependency compatibility

Update third-party libraries to versions compatible with Angular 22.

### Step 4 — Resolve compilation issues

Address TypeScript and Angular compiler issues exposed by the newer toolchain.

### Step 5 — Validate the build

Run:

```bash
npm run build
```

### Step 6 — Validate tests

Run the existing test suite.

### Step 7 — Validate application functionality

Test the major application areas manually.

### Step 8 — Perform modernization separately

After the framework upgrade is stable, evaluate:

* Standalone components.
* Signals.
* Signal inputs/models.
* Built-in control flow.
* `@defer`.
* Zoneless.
* Signal Forms.
* Resource APIs.
* Vitest.

---

# 37. Final Recommendation

The application should be upgraded to **Angular 22 rather than stopping at Angular 18, 19, 20, or 21**.

The reason is not simply that Angular 22 has newer features.

The stronger technical justification is that Angular 22 provides a **modern supported foundation** that aligns:

```text
Framework
    +
CLI
    +
Node.jscommand to
    +
TypeScript
    +
Build tooling
    +
Third-party dependencies
```

Moving only to an intermediate Angular version would provide a temporary improvement but would leave the project closer to another major upgrade.

Angular 22 provides a better long-term baseline and gives the project access to the modern Angular ecosystem.

The upgrade should therefore be treated as:

> **A framework, tooling, compatibility, maintainability, and technical-debt reduction initiative, with modern Angular features available for incremental adoption.**

---

# 38. References

## Official Angular Documentation

* Angular version compatibility:
  https://angular.dev/reference/versions

* Angular releases and support lifecycle:
  https://angular.dev/reference/releases

* Angular Update Guide:
  https://angular.dev/update

* Angular migrations:
  https://angular.dev/reference/migrations

* Standalone migration:
  https://angular.dev/reference/migrations/standalone

* Control flow migration:
  https://angular.dev/reference/migrations/control-flow

* Angular roadmap:
  https://angular.dev/roadmap

* Zoneless Angular:
  https://angular.dev/guide/zoneless

* Signal Forms:
  https://angular.dev/guide/forms/signals/overview

---

# 39. Key Takeaway

The decision can be summarized as:

```text
Why upgrade?
        ↓
Angular 17 is outdated and unsupported
        ↓
Why not 18 / 19 / 20?
        ↓
They are intermediate versions and do not provide
the desired current baseline
        ↓
Why not stop at 21?
        ↓
Angular 22 is the selected current target and
provides the latest compatibility and capabilities
required by the project
        ↓
Why Angular 22?
        ↓
Supported framework
+
Modern Node.js compatibility
+
Modern TypeScript
+
Modern CLI/build system
+
Current dependency ecosystem
+
Signals
+
Standalone APIs
+
Modern control flow
+
Performance opportunities
+
Future modernization path
        ↓
Result
        ↓
More maintainable, supported and future-ready application
```

**Final target: Angular 22**
