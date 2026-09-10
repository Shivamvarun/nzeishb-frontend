import { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SPATIAL_API } from '../api/spatial/spatial-api.port';
import { SCENARIO_API } from '../api/scenario/scenario-api.port';
import { OPTIMIZATION_API } from '../api/optimization/optimization-api.port';
import { BIM_API } from '../api/bim/bim-api.port';
import { AUDIT_API } from '../api/audit/audit-api.port';
import { MIGRATION_API } from '../api/migration/migration-api.port';
import { REPORT_API } from '../api/report/report-api.port';
import { NORMATIVE_API } from '../api/normative/normative-api.port';
import { AI_API } from '../api/ai/ai-api.port';
import { WORKSPACE_API } from '../api/workspace/workspace-api.port';
import { CATALOG_API } from '../api/catalog/catalog-api.port';
import { SPATIAL_CONTEXT_API } from '../api/spatial/spatial-context-api.port';
import { HttpSpatialContextApiAdapter } from './adapters/http/http-spatial-context-api.adapter';
import { MockSpatialContextApiAdapter } from './adapters/mock/mock-spatial-context-api.adapter';
import { HttpSpatialApiAdapter } from './adapters/http/http-spatial-api.adapter';
import { HttpScenarioApiAdapter } from './adapters/http/http-scenario-api.adapter';
import { HttpOptimizationApiAdapter } from './adapters/http/http-optimization-api.adapter';
import { HttpBimApiAdapter } from './adapters/http/http-bim-api.adapter';
import { HttpAuditApiAdapter } from './adapters/http/http-audit-api.adapter';
import { HttpMigrationApiAdapter } from './adapters/http/http-migration-api.adapter';
import { HttpReportApiAdapter } from './adapters/http/http-report-api.adapter';
import { HttpNormativeApiAdapter } from './adapters/http/http-normative-api.adapter';
import { HttpAiApiAdapter } from './adapters/http/http-ai-api.adapter';
import { HttpWorkspaceApiAdapter } from './adapters/http/http-workspace-api.adapter';
import { MockSpatialApiAdapter } from './adapters/mock/mock-spatial-api.adapter';
import { MockScenarioApiAdapter } from './adapters/mock/mock-scenario-api.adapter';
import { MockOptimizationApiAdapter } from './adapters/mock/mock-optimization-api.adapter';
import { MockBimApiAdapter } from './adapters/mock/mock-bim-api.adapter';
import { MockAuditApiAdapter } from './adapters/mock/mock-audit-api.adapter';
import { MockMigrationApiAdapter } from './adapters/mock/mock-migration-api.adapter';
import { MockReportApiAdapter } from './adapters/mock/mock-report-api.adapter';
import { MockNormativeApiAdapter } from './adapters/mock/mock-normative-api.adapter';
import { MockAiApiAdapter } from './adapters/mock/mock-ai-api.adapter';
import { MockWorkspaceApiAdapter } from './adapters/mock/mock-workspace-api.adapter';
import { MockCatalogApiAdapter } from './adapters/mock/mock-catalog-api.adapter';
import { HttpCatalogApiAdapter } from './adapters/http/http-catalog-api.adapter';

/**
 * AI_API is deliberately switched by its own `useMockAi` flag instead of
 * the blanket `useMockApi` flag: ai-service is the only backend service
 * with a real, working implementation right now (see environment.ts).
 * Flipping `useMockApi` for every port at once would move
 * workspace/spatial/scenario/etc. onto Http adapters whose backends
 * aren't wired up yet.
 */
const useMockApi = environment.useMockApi;

const apiProviders: Provider[] = [
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

const aiApiProvider: Provider = {
  provide: AI_API,
  useClass: environment.useMockAi ? MockAiApiAdapter : HttpAiApiAdapter
};

export function provideAppHttp(): Array<Provider | EnvironmentProviders> {
  return [
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    ...apiProviders,
    aiApiProvider
  ];
}
