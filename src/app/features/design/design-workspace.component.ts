import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AppState } from '../../core/models/app.models';
import { StoreService } from '../../core/state/store.service';
import { VpoFormComponent } from '../scenario/vpo-form.component';

@Component({
    selector: 'app-design-workspace',
    templateUrl: './design-workspace.component.html',
    styleUrls: ['./design-workspace.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DecimalPipe, VpoFormComponent]
})
export class DesignWorkspaceComponent {
  state: AppState = this.store.getState();
  constructor(private readonly store: StoreService) { this.store.state$.subscribe(state => this.state = state); }
}
