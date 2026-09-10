import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AppState, VpoParams } from '../../../../core/models/app.models';
import { StoreService } from '../../../../core/services/store.service';
@Component({
    selector: 'app-vpo-form', templateUrl: './vpo-form.component.html', styleUrls: ['./vpo-form.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DecimalPipe]
})
export class VpoFormComponent {
  state: AppState = this.store.getState();
  constructor(private readonly store: StoreService) { this.store.state$.subscribe(state => this.state = state); }
  update(key: keyof VpoParams, value: number): void { this.store.updateVPOParams({ [key]: value }); }
  optimize(): void { void this.store.optimize(); }
  createScenario(): void { void this.store.createScenario(); }
  reopenScenario(id: string): void { this.store.reopenScenario(id); }
  deleteScenario(id: string): void { void this.store.deleteScenario(id); }
}
