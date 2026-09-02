# nZEISHB / AVRA Frontend PoC

Independent Angular 17 frontend for the AVRA/nZEISHB PoC.

## Capability shell

The top navigation is intentionally aligned to the PoC capability showcase:

- **Spatial** — GIS/parcel selection and planning-data handoff.
- **Catalog** — industrialised modules/systems/elements.
- **Scenario** — planning criteria and scenario inputs. This is a frontend grouping for the scenario step; it is not a new backend bounded context.
- **Optimisation** — NSGA-III run results and the three-objective Pareto view.
- **IFC / BIM** — selected-solution BIM/IFC presentation.
- **Solutions** — solution-manager-oriented selection/comparison UI.
- **Reports** — generated deliverables.

The PoC documentation explicitly calls out Catalog, Optimisation/Pareto, IFC and AI as priority capabilities, while scenario, spatial and report-generation are allowed to remain simple panes until gateway routes/contracts are available. The shell therefore keeps these capabilities cheap to replace with real gateway calls.

## Architecture

```text
Angular feature
    -> Store / application state
    -> domain API port
    -> HTTP adapter OR Mock adapter
    -> /api/v1 gateway
    -> bounded-context service
```

Feature components do not call `HttpClient` directly.

API contracts live under:

```text
src/app/core/api/<domain>/
```

Concrete integrations live under:

```text
src/app/core/api/adapters/http/
src/app/core/api/adapters/mock/
```

The HTTP/mock implementation is selected by Angular DI in `app.module.ts`.

## Backend integration

The gateway base URL is `/api/v1`.

When a backend contract becomes available, implement/update the corresponding HTTP adapter and keep the feature UI dependent on the port. Do not move backend orchestration into the browser.

The optimisation context is expected to be assembled by backend services; the browser only sends the inputs/identifier required by the gateway contract.

## Local setup

```bash
pnpm install
pnpm exec ng build
pnpm exec ng serve --open
```

For the PoC, `environment.ts` uses mock adapters. Production configuration switches to HTTP adapters.

If pnpm reports ignored build scripts, approve the required build scripts and then reinstall as described in the AVRA frontend setup/troubleshooting document.


## Source-of-truth rule

Functional behaviour follows the AVRA documentation and published backend contracts. Figma is used for visual design and interaction styling, not as a source for inventing backend capabilities. The frontend keeps service boundaries behind API ports and adapters so the feature components do not need to change when a real gateway implementation replaces a mock.

The optimisation view treats the result returned by the optimisation API as authoritative; Pareto dominance is not recalculated in the browser. The AI chat is isolated behind `AiApiPort`; it is not implemented as a direct Normative-service call.

## Alignment note

This PoC follows the documented AVRA capability responsibilities and uses Figma as the visual reference. It intentionally does not reproduce every Figma screen or invent backend behaviour. See `FRONTEND_ALIGNMENT.md` for the current integration boundaries and contract-dependent areas.
