import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActiveView } from './core/models/app.models';
import { StoreService } from './core/services/store.service';
import { BimComponent } from './features/bim/bim.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { NormativeChatComponent } from './features/normative-chat/normative-chat.component';
import { OptimizationComponent } from './features/optimization/optimization.component';
import { ReportsComponent } from './features/reports/reports.component';
import { ScenarioComponent } from './features/scenario/scenario.component';
import { VpoFormComponent } from './features/scenario/components/vpo-form/vpo-form.component';
import { SolutionsComponent } from './features/solutions/solutions.component';
import { SpatialComponent } from './features/spatial/spatial.component';

@Component({
    selector: 'app-root', templateUrl: './app.component.html', styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
      AsyncPipe,
      VpoFormComponent,
      SpatialComponent,
      CatalogComponent,
      ScenarioComponent,
      OptimizationComponent,
      BimComponent,
      SolutionsComponent,
      ReportsComponent,
      NormativeChatComponent
    ]
})
export class AppComponent {
  readonly state$ = this.store.state$;
  constructor(private readonly store: StoreService) {}
  setView(view: ActiveView): void { this.store.setActiveView(view); }
  isView(view: ActiveView): boolean { return this.store.getState().activeView === view; }
  saveScenario(): void { void this.store.saveScenario(); }
}
