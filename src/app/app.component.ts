import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ShellService } from './core/shared/services/shell.service';
import { WorkspaceUseCase } from './features/workspace/use-cases/workspace.use-case';
import { NormativeChatComponent } from './features/normative-chat/normative-chat.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe, RouterOutlet, HeaderComponent, NormativeChatComponent]
})
export class AppComponent {
  readonly error$ = this.shell.error$;
  readonly success$ = this.shell.success$;
  constructor(
    private readonly shell: ShellService,
    _workspace: WorkspaceUseCase
  ) {}
}
