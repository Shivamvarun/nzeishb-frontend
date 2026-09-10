import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AppState } from '../../core/models/app.models';
import { StoreService } from '../../core/services/store.service';
import { VpoFormComponent } from './components/vpo-form/vpo-form.component';

@Component({
    selector: 'app-scenario',
    templateUrl: './scenario.component.html',
    styleUrls: ['./scenario.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DecimalPipe, VpoFormComponent]
})
export class ScenarioComponent {
  state: AppState = this.store.getState();
  constructor(private readonly store: StoreService) { this.store.state$.subscribe(state => this.state = state); }
}
