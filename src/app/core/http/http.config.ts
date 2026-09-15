import { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BIM_API } from '../../features/bim/services/bim-api.port';
import { BimHttpService } from '../../features/bim/services/bim-http.service';
import { BimMockService } from '../../features/bim/services/bim-mock.service';
import { CATALOG_API } from '../../features/catalog/services/catalog-api.port';
import { CatalogHttpService } from '../../features/catalog/services/catalog-http.service';
import { CatalogMockService } from '../../features/catalog/services/catalog-mock.service';
import { AI_API } from '../../features/normative-chat/services/ai-api.port';
import { AiHttpService } from '../../features/normative-chat/services/ai-http.service';
import { AiMockService } from '../../features/normative-chat/services/ai-mock.service';
import { OPTIMIZATION_API } from '../../features/optimization/services/optimization-api.port';
import { OptimizationHttpService } from '../../features/optimization/services/optimization-http.service';
import { OptimizationMockService } from '../../features/optimization/services/optimization-mock.service';
import { REPORT_API } from '../../features/reports/services/report-api.port';
import { ReportHttpService } from '../../features/reports/services/report-http.service';
import { ReportMockService } from '../../features/reports/services/report-mock.service';
import { SCENARIO_API } from '../../features/scenario/services/scenario-api.port';
import { ScenarioHttpService } from '../../features/scenario/services/scenario-http.service';
import { ScenarioMockService } from '../../features/scenario/services/scenario-mock.service';
import { SPATIAL_API } from '../../features/spatial/services/spatial-api.port';
import { SpatialHttpService } from '../../features/spatial/services/spatial-http.service';
import { SpatialMockService } from '../../features/spatial/services/spatial-mock.service';
import { WORKSPACE_API } from '../../features/workspace/services/workspace-api.port';
import { WorkspaceHttpService } from '../../features/workspace/services/workspace-http.service';
import { WorkspaceMockService } from '../../features/workspace/services/workspace-mock.service';

/**
 * AI_API is switched by `useMockAi` instead of the blanket `useMockApi` flag:
 * ai-service is the only backend with a real implementation right now.
 */
const useMockApi = environment.useMockApi;

const apiProviders: Provider[] = [
  { provide: SPATIAL_API, useClass: useMockApi ? SpatialMockService : SpatialHttpService },
  { provide: SCENARIO_API, useClass: useMockApi ? ScenarioMockService : ScenarioHttpService },
  { provide: OPTIMIZATION_API, useClass: useMockApi ? OptimizationMockService : OptimizationHttpService },
  { provide: BIM_API, useClass: useMockApi ? BimMockService : BimHttpService },
  { provide: REPORT_API, useClass: useMockApi ? ReportMockService : ReportHttpService },
  { provide: WORKSPACE_API, useClass: useMockApi ? WorkspaceMockService : WorkspaceHttpService },
  { provide: CATALOG_API, useClass: useMockApi ? CatalogMockService : CatalogHttpService }
];

const aiApiProvider: Provider = {
  provide: AI_API,
  useClass: environment.useMockAi ? AiMockService : AiHttpService
};

export function provideAppHttp(): Array<Provider | EnvironmentProviders> {
  return [
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    ...apiProviders,
    aiApiProvider
  ];
}
