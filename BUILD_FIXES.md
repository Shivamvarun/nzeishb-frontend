# Build fixes applied

1. Fixed `HttpCatalogApiAdapter` environment import path to `../../../../../environments/environment`.
2. Kept Leaflet's `map` field private and exposed `zoomIn()` / `zoomOut()` methods for the Angular template.
3. Added `leaflet` to Angular's `allowedCommonJsDependencies` to suppress the known CommonJS optimization warning.

No API-port/adapter architecture was changed.
