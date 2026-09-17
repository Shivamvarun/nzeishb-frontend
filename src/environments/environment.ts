export const environment = {
  production: false,

  /**
   * Only ai-service has a real, working backend right now. Every other
   * port (workspace, spatial, scenario, ...) stays on its Mock adapter
   * until its backend is actually wired up — see core/http/http.config.ts, which
   * switches AI_API independently via `useMockAi` below.
   */
  apiBaseUrl: '/api/v1',
  useMockApi: true,

  /**
   * AI (nZEISHB Agent) integration.
   *
   * Leave this empty so the browser calls same-origin `/api/v1/ai/*`.
   * `ng serve` forwards those requests to the local ai-service (port 4007)
   * via proxy.conf.json. A direct localhost URL is a different origin from
   * `:4200`, so the browser blocks it unless the API sends CORS.
   */
  useMockAi: false,
  aiApiBaseUrl: '',
  aiConversationsPath: '/ai/conversations',
  aiMessagesPath: '/ai/messages',

  /**
   * PoC placeholders. There is no identity-service session in the frontend
   * yet, but the AgentCore contract requires user_id/project_id on every
   * turn. Replace with real values once identity-service is wired in.
   */
  aiUserId: 'demo-user',
  aiProjectId: 'demo-project',

  spatialContextApiPath: '',
  mapTileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  mapAttribution: '&copy; OpenStreetMap contributors'
};