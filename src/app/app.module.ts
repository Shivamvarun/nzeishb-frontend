import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { GisViewerComponent } from './features/spatial/gis-viewer.component';
import { VpoFormComponent } from './features/scenario/vpo-form.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ParetoExplorerComponent } from './features/solutions/pareto-explorer.component';
import { ComparatorComponent } from './features/solutions/comparator.component';
import { ReportsExportComponent } from './features/reports/reports-export.component';
import { RagChatbotComponent } from './features/normative-chat/rag-chatbot.component';
import { BimViewerComponent } from './features/bim/bim-viewer.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { DesignWorkspaceComponent } from './features/design/design-workspace.component';
import { SolutionsWorkspaceComponent } from './features/solutions-shell/solutions-workspace.component';
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

const apiProviders = environment.useMockApi
  ? [
      { provide: SPATIAL_API, useClass: MockSpatialApiAdapter },
      { provide: SCENARIO_API, useClass: MockScenarioApiAdapter },
      { provide: OPTIMIZATION_API, useClass: MockOptimizationApiAdapter },
      { provide: BIM_API, useClass: MockBimApiAdapter },
      { provide: AUDIT_API, useClass: MockAuditApiAdapter },
      { provide: MIGRATION_API, useClass: MockMigrationApiAdapter },
      { provide: REPORT_API, useClass: MockReportApiAdapter },
      { provide: NORMATIVE_API, useClass: MockNormativeApiAdapter },
      { provide: AI_API, useClass: MockAiApiAdapter },
      { provide: WORKSPACE_API, useClass: MockWorkspaceApiAdapter },
      { provide: CATALOG_API, useClass: MockCatalogApiAdapter },
      { provide: SPATIAL_CONTEXT_API, useClass: MockSpatialContextApiAdapter }
    ]
  : [
      { provide: SPATIAL_API, useClass: HttpSpatialApiAdapter },
      { provide: SCENARIO_API, useClass: HttpScenarioApiAdapter },
      { provide: OPTIMIZATION_API, useClass: HttpOptimizationApiAdapter },
      { provide: BIM_API, useClass: HttpBimApiAdapter },
      { provide: AUDIT_API, useClass: HttpAuditApiAdapter },
      { provide: MIGRATION_API, useClass: HttpMigrationApiAdapter },
      { provide: REPORT_API, useClass: HttpReportApiAdapter },
      { provide: NORMATIVE_API, useClass: HttpNormativeApiAdapter },
      { provide: AI_API, useClass: HttpAiApiAdapter },
      { provide: WORKSPACE_API, useClass: HttpWorkspaceApiAdapter },
      { provide: CATALOG_API, useClass: HttpCatalogApiAdapter },
      { provide: SPATIAL_CONTEXT_API, useClass: HttpSpatialContextApiAdapter }
    ];

@NgModule({
  declarations: [
    AppComponent,
    GisViewerComponent,
    VpoFormComponent,
    DashboardComponent,
    ParetoExplorerComponent,
    ComparatorComponent,
    ReportsExportComponent,
    RagChatbotComponent,
    BimViewerComponent,
    CatalogComponent,
    DesignWorkspaceComponent,
    SolutionsWorkspaceComponent
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  providers: [...apiProviders],
  bootstrap: [AppComponent]
})
export class AppModule {}
