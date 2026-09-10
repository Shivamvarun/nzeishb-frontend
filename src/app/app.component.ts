import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActiveView } from './core/models/app.models';
import { StoreService } from './core/state/store.service';
import { BimViewerComponent } from './features/bim/bim-viewer.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { DesignWorkspaceComponent } from './features/design/design-workspace.component';
import { RagChatbotComponent } from './features/normative-chat/rag-chatbot.component';
import { ReportsExportComponent } from './features/reports/reports-export.component';
import { VpoFormComponent } from './features/scenario/vpo-form.component';
import { SolutionsWorkspaceComponent } from './features/solutions-shell/solutions-workspace.component';
import { ParetoExplorerComponent } from './features/solutions/pareto-explorer.component';
import { GisViewerComponent } from './features/spatial/gis-viewer.component';

@Component({
    selector: 'app-root', templateUrl: './app.component.html', styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
      AsyncPipe,
      VpoFormComponent,
      GisViewerComponent,
      CatalogComponent,
      DesignWorkspaceComponent,
      ParetoExplorerComponent,
      BimViewerComponent,
      SolutionsWorkspaceComponent,
      ReportsExportComponent,
      RagChatbotComponent
    ]
})
export class AppComponent {
  readonly state$ = this.store.state$;
  constructor(private readonly store: StoreService) {}
  setView(view: ActiveView): void { this.store.setActiveView(view); }
  isView(view: ActiveView): boolean { return this.store.getState().activeView === view; }
  saveScenario(): void { void this.store.saveScenario(); }
}
