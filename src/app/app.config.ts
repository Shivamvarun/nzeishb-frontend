import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';
import { environment } from '../environments/environment';
import { SPATIAL_API } from './core/api/spatial/spatial-api.port';
import { SCENARIO_API } from './core/api/scenario/scenario-api.port';
import { OPTIMIZATION_API } from './core/api/optimization/optimization-api.port';
import { BIM_API } from './core/api/bim/bim-api.port';
import { AUDIT_API } from './core/api/audit/audit-api.port';
import { MIGRATION_API } from './core/api/migration/migration-api.port';
import { REPORT_API } from './core/api/report/report-api.port';
import { NORMATIVE_API } from './core/api/normative/normative-api.port';
import { AI_API } from './core/api/ai/ai-api.port';
import { WORKSPACE_API } from './core/api/workspace/workspace-api.port';
import { CATALOG_API } from './core/api/catalog/catalog-api.port';
import { SPATIAL_CONTEXT_API } from './core/api/spatial/spatial-context-api.port';
import { HttpSpatialContextApiAdapter } from './core/api/adapters/http/http-spatial-context-api.adapter';
import { MockSpatialContextApiAdapter } from './core/api/adapters/mock/mock-spatial-context-api.adapter';
import { HttpSpatialApiAdapter } from './core/api/adapters/http/http-spatial-api.adapter';
import { HttpScenarioApiAdapter } from './core/api/adapters/http/http-scenario-api.adapter';
import { HttpOptimizationApiAdapter } from './core/api/adapters/http/http-optimization-api.adapter';
import { HttpBimApiAdapter } from './core/api/adapters/http/http-bim-api.adapter';
import { HttpAuditApiAdapter } from './core/api/adapters/http/http-audit-api.adapter';
import { HttpMigrationApiAdapter } from './core/api/adapters/http/http-migration-api.adapter';
import { HttpReportApiAdapter } from './core/api/adapters/http/http-report-api.adapter';
import { HttpNormativeApiAdapter } from './core/api/adapters/http/http-normative-api.adapter';
import { HttpAiApiAdapter } from './core/api/adapters/http/http-ai-api.adapter';
import { HttpWorkspaceApiAdapter } from './core/api/adapters/http/http-workspace-api.adapter';
import { MockSpatialApiAdapter } from './core/api/adapters/mock/mock-spatial-api.adapter';
import { MockScenarioApiAdapter } from './core/api/adapters/mock/mock-scenario-api.adapter';
import { MockOptimizationApiAdapter } from './core/api/adapters/mock/mock-optimization-api.adapter';
import { MockBimApiAdapter } from './core/api/adapters/mock/mock-bim-api.adapter';
import { MockAuditApiAdapter } from './core/api/adapters/mock/mock-audit-api.adapter';
import { MockMigrationApiAdapter } from './core/api/adapters/mock/mock-migration-api.adapter';
import { MockReportApiAdapter } from './core/api/adapters/mock/mock-report-api.adapter';
import { MockNormativeApiAdapter } from './core/api/adapters/mock/mock-normative-api.adapter';
import { MockAiApiAdapter } from './core/api/adapters/mock/mock-ai-api.adapter';
import { MockWorkspaceApiAdapter } from './core/api/adapters/mock/mock-workspace-api.adapter';
import { MockCatalogApiAdapter } from './core/api/adapters/mock/mock-catalog-api.adapter';
import { HttpCatalogApiAdapter } from './core/api/adapters/http/http-catalog-api.adapter';

/**
 * AI_API is deliberately switched by its own `useMockAi` flag instead of
 * the blanket `useMockApi` flag: ai-service is the only backend service
 * with a real, working implementation right now (see environment.ts).
 * Flipping `useMockApi` for every port at once would move
 * workspace/spatial/scenario/etc. onto Http adapters whose backends
 * aren't wired up yet.
 */
const useMockApi = environment.useMockApi;

const apiProviders = [
  { provide: SPATIAL_API, useClass: useMockApi ? MockSpatialApiAdapter : HttpSpatialApiAdapter },
  { provide: SCENARIO_API, useClass: useMockApi ? MockScenarioApiAdapter : HttpScenarioApiAdapter },
  { provide: OPTIMIZATION_API, useClass: useMockApi ? MockOptimizationApiAdapter : HttpOptimizationApiAdapter },
  { provide: BIM_API, useClass: useMockApi ? MockBimApiAdapter : HttpBimApiAdapter },
  { provide: AUDIT_API, useClass: useMockApi ? MockAuditApiAdapter : HttpAuditApiAdapter },
  { provide: MIGRATION_API, useClass: useMockApi ? MockMigrationApiAdapter : HttpMigrationApiAdapter },
  { provide: REPORT_API, useClass: useMockApi ? MockReportApiAdapter : HttpReportApiAdapter },
  { provide: NORMATIVE_API, useClass: useMockApi ? MockNormativeApiAdapter : HttpNormativeApiAdapter },
  { provide: WORKSPACE_API, useClass: useMockApi ? MockWorkspaceApiAdapter : HttpWorkspaceApiAdapter },
  { provide: CATALOG_API, useClass: useMockApi ? MockCatalogApiAdapter : HttpCatalogApiAdapter },
  { provide: SPATIAL_CONTEXT_API, useClass: useMockApi ? MockSpatialContextApiAdapter : HttpSpatialContextApiAdapter }
];

const aiApiProvider = {
  provide: AI_API,
  useClass: environment.useMockAi ? MockAiApiAdapter : HttpAiApiAdapter
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideMarkdown(),
    ...apiProviders,
    aiApiProvider
  ]
};
