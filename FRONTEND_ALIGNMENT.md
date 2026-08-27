# ARVA / nZEISHB Frontend Alignment

## Source of truth

- Functional behaviour: ARVA documentation and published backend contracts.
- Visual language and interaction styling: supplied ARVA Figma export.
- The frontend does not invent backend/domain calculations where the documentation assigns responsibility to a backend service.

## Changes in this revision

- Kept the Angular feature + API port + adapter structure.
- Kept mock and HTTP adapters behind Angular DI.
- Added a dedicated `AiApiPort`; the chat is no longer modelled as a direct Normative-service call.
- Removed browser-side Pareto dominance calculation. Optimisation results returned by the optimisation port are treated as authoritative.
- Kept the Pareto view as a three-objective visual surface: cost, energy efficiency and industrialisation.
- Spatial planning dialog no longer opens automatically. It opens from the Building data card.
- Added a documented Spatial layer-drawer surface. VPO-eligible parcels and cadastral parcels are the available default visual layers; other documented groups are shown as unavailable until their gateway contracts/data are wired.
- Isolated map tile configuration in the environment so a future Spatial proxy can replace the PoC OSM source without changing the viewer.
- Kept Scenario as the scenario/design frontend capability; it is not presented as a new backend bounded context.
- Solutions no longer presents scenario history as persisted Solution Manager data. It presents the current optimisation candidates and comparison surface, while persistence remains a backend/Solution Manager responsibility.
- Added an IFC generation action to the BIM surface.
- Reworked the ARVA AI chat launcher/window to follow the supplied Figma visual language.
- Reworked Reports into a thin gateway slot rather than inventing report-generation orchestration in the browser.
- Aligned the BIM/Reports surfaces to the supplied ARVA light visual system.
- Centralised current PoC gateway paths in `src/app/core/api/api-routes.ts`; when published backend routes differ, update the adapter boundary/configuration rather than feature components.

## Backend integration boundary

```text
Angular feature
    -> Store / feature state
    -> API Port
    -> HTTP Adapter
    -> /api/v1 gateway
    -> bounded-context service
```

Feature components do not use `HttpClient` directly.

The exact request/response payloads and endpoint names must be aligned to the published backend contracts when those contracts are available. The HTTP adapters are deliberately isolated so those changes do not require a UI rewrite.

## Known contract-dependent areas

The current repository does not establish final public gateway routes for every capability. In particular, the AI route is intentionally not hard-coded as a claimed final ARVA contract (`environment.aiApiPath` is empty by default). Configure/implement the HTTP adapter when the actual AI gateway contract is published.

Likewise, Spatial layer tile/feature contracts, SpatialContext ownership, and the final Parcel/Plot terminology/geometry decisions remain subject to the documented PM clarifications. The frontend therefore avoids pretending those unresolved decisions are final.


## 2026-08-27 follow-up
- Report pane keeps the documented thin-gateway wording and does not perform report orchestration in the browser.
- AI chat now has working new-conversation, help, close and send interactions; the help text reflects the documented read-only AI role.
- Spatial toolbar now wires edit/delete/2D/fullscreen/collapse controls. Rotation is exposed honestly as a client-side tool selection; no fake 3D renderer is introduced.
- Spatial layer drawer now reflects the documented eight thematic groups; unavailable groups remain disabled until their backend layer contracts are connected.
- Figma GIS icon assets are isolated under src/assets/arva-icons so they can be replaced without changing feature logic.
