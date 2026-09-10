/**
 * Current PoC gateway paths are isolated here so backend contract changes do
 * not leak into feature components. Replace these values when the published
 * gateway routes are finalised; the feature ports stay unchanged.
 */
export const API_ROUTES = {
  workspace: '/workspace',
  spatial: {
    plots: '/spatial/plots',
    cadastral: (reference: string) => `/spatial/plots/cadastral/${encodeURIComponent(reference)}`,
    // Optional until the published SpatialContext gateway contract lands.
    spatialContext: '/spatial/context'
  },
  catalog: '/catalog/modules',
  scenarios: '/scenarios',
  scenario: (id: string) => `/scenarios/${encodeURIComponent(id)}`,
  optimisation: '/optimization/solutions',
  bim: '/artifacts/ifc',
  reports: {
    budget: '/reports/budget',
    generate: '/reports/generate'
  },
  audit: '/audit/events',
  normative: '/normative/query'
} as const;
