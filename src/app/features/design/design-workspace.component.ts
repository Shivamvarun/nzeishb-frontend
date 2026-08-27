import { Component } from '@angular/core';
import { AppState } from '../../core/models/app.models';
import { StoreService } from '../../core/state/store.service';

@Component({
  selector: 'app-design-workspace',
  templateUrl: './design-workspace.component.html',
  styleUrls: ['./design-workspace.component.css']
})
export class DesignWorkspaceComponent {
  state: AppState = this.store.getState();
  constructor(private readonly store: StoreService) { this.store.state$.subscribe(state => this.state = state); }
}
