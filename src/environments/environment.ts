export const environment = {
  production: false,

  /**
   * Only ai-service has a real, working backend right now. Every other
   * port (workspace, spatial, scenario, ...) stays on its Mock adapter
   * until its backend is actually wired up — see app.module.ts, which
   * switches AI_API independently via `useMockAi` below.
   */
  apiBaseUrl: '/api/v1',
  useMockApi: true,

  /**
   * AI (nZEISHB Agent) integration.
   *
   * ai-service has no CORS registered (packages/http-contracts's
   * createPlatformApp doesn't add @fastify/cors), and the api-gateway
   * doesn't yet proxy /api/v1/ai/* either (apps/api-gateway/src/main.ts
   * TODO). Rather than opening CORS on the backend, `ng serve`'s dev
   * proxy (proxy.conf.json) forwards /api/v1/ai/* to
   * http://localhost:4007 so the browser stays same-origin. aiApiBaseUrl
   * can therefore stay empty here too — this now matches
   * environment.prod.ts, and both are already correct for the day the
   * gateway proxy ships (nothing to change here then).
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