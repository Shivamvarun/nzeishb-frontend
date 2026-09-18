export const environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  useMockApi: true,
  useMockAi: false,

  /**
   * Leave empty so the browser calls same-origin `/api/v1`.
   * On Vercel, vercel.json rewrites `/api/*` to
   * https://nzeishb.api.typsadev.com/api/*. proxy.conf.json is only used
   * by `ng serve` and does not apply on Vercel.
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