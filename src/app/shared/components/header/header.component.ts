import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ActiveView } from '../../../core/shared/models/common.models';
import { ChatUseCase } from '../../../features/normative-chat/use-cases/chat.use-case';
import { ScenarioUseCase } from '../../../features/scenario/use-cases/scenario.use-case';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe, ButtonComponent]
})
export class HeaderComponent {
  readonly state$ = this.scenario.state$;
  readonly navItems: readonly { view: ActiveView; path: string; label: string }[] = [
    { view: 'spatial', path: '/', label: 'Spatial' },
    { view: 'catalog', path: '/catalog', label: 'Catalog' },
    { view: 'scenario', path: '/scenario', label: 'Scenario' },
    { view: 'optimization', path: '/optimization', label: 'Optimisation' },
    { view: 'bim', path: '/bim', label: 'IFC / BIM' },
    { view: 'solutions', path: '/solutions', label: 'Solutions' },
    { view: 'reports', path: '/reports', label: 'Reports' }
  ];

  constructor(
    private readonly scenario: ScenarioUseCase,
    private readonly chat: ChatUseCase,
    private readonly router: Router
  ) {}

  setView(path: string): void {
    void this.router.navigateByUrl(path);
  }

  isView(view: ActiveView): boolean {
    return this.chat.getState().activeView === view;
  }

  navClass(view: ActiveView): string {
    const base = 'relative h-full whitespace-nowrap rounded-none border-0 bg-surface px-[11px] py-0 text-[13px] font-[750] text-brand hover:bg-tint-2 max-[1100px]:px-[7px] max-[1100px]:text-xs';
    return this.isView(view)
      ? `${base} after:absolute after:right-[11px] after:bottom-0 after:left-[11px] after:h-0.5 after:bg-brand max-[1100px]:after:right-[7px] max-[1100px]:after:left-[7px]`
      : base;
  }

  saveScenario(): void {
    void this.scenario.saveScenario();
  }
}
