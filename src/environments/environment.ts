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
   * Calls the hosted API directly from the browser. Other services stay
   * on Mock adapters until their backends are wired up — see
   * core/http/http.config.ts, which switches AI_API independently via
   * `useMockAi` below.
   */
  useMockAi: false,
  aiApiBaseUrl: 'https://nzeishb.api.typsadev.com/api/v1',
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