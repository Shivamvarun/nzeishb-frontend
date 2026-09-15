import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VpoFormComponent } from '../features/scenario/components/vpo-form/vpo-form.component';
import { SpatialComponent } from '../features/spatial/spatial.component';
import { ButtonComponent } from '../shared/components/button/button.component';

@Component({
  selector: 'app-spatial-layout',
  standalone: true,
  template: `
    <aside class="spatial-sidebar" [class.is-closed]="!sidebarOpen">
      <div class="sidebar-toolbar">
        <app-button
          variant="outlined"
          size="none"
          [className]="toggleClass"
          [title]="sidebarOpen ? 'Close sidebar' : 'Open sidebar'"
          [ariaLabel]="sidebarOpen ? 'Close sidebar' : 'Open sidebar'"
          (click)="toggleSidebar()">
          {{ sidebarOpen ? '‹' : '›' }}
        </app-button>
      </div>
      @if (sidebarOpen) {
        <app-vpo-form></app-vpo-form>
      }
    </aside>
    <section class="workspace-view">
      <app-spatial></app-spatial>
    </section>
  `,
  styleUrl: './spatial-layout.component.css',
  host: {
    '[class.sidebar-collapsed]': '!sidebarOpen'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VpoFormComponent, SpatialComponent, ButtonComponent]
})
export class SpatialLayoutComponent {
  sidebarOpen = true;
  readonly toggleClass =
    'size-7 rounded-full border-header-border bg-surface text-base font-extrabold text-brand !gap-0';

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
