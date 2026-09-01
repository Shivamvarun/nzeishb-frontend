export const environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  useMockApi: false,
  useMockAi: false,

  /**
   * Production is expected to go through the api-gateway once its
   * /api/v1/ai/* proxy is implemented (currently a TODO in
   * apps/api-gateway/src/main.ts). Leaving this empty makes the adapter
   * fall back to `${apiBaseUrl}` so no code change is needed once the
   * gateway route exists — only this file changes if a direct ai-service
   * URL is still required at deploy time.
   */
  aiApiBaseUrl: '',
  aiConversationsPath: '/ai/conversations',
  aiMessagesPath: '/ai/messages',

  /**
   * PoC placeholders — replace once identity-service issues real
   * user/project identity to the frontend.
   */
  aiUserId: 'demo-user',
  aiProjectId: 'demo-project',

  spatialContextApiPath: '',
  mapTileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  mapAttribution: '&copy; OpenStreetMap contributors'
};