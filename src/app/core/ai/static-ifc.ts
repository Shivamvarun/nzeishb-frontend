/** Static IFC for the BIM viewer. Chat uses solutionId; ai-service owns the IFC URI. */
export const STATIC_IFC = {
  fileName: 'modelo.ifc',
  solutionId: 'demo',
  assetUrl: 'assets/ifc/modelo.ifc',
  wasmPath: 'assets/wasm/'
} as const;

/** Origin-absolute URL for files under `src/assets`. */
export function staticAssetUrl(relativePath: string): string {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}/${relativePath}`.replace(/([^:]\/)\/+/g, '$1');
}
