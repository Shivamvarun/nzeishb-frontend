import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VpoFormComponent } from '../features/scenario/components/vpo-form/vpo-form.component';
import { SpatialComponent } from '../features/spatial/spatial.component';

@Component({
  selector: 'app-spatial-layout',
  standalone: true,
  template: `
    <aside class="z-20 overflow-auto border-r border-header-border bg-surface p-3.5 max-[820px]:hidden">
      <app-vpo-form></app-vpo-form>
    </aside>
    <section class="workspace-view">
      <app-spatial></app-spatial>
    </section>
  `,
  styleUrl: './spatial-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VpoFormComponent, SpatialComponent]
})
export class SpatialLayoutComponent {}
