import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { StoreService } from './core/services/store.service';
import { NormativeChatComponent } from './features/normative-chat/normative-chat.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe, RouterOutlet, HeaderComponent, NormativeChatComponent]
})
export class AppComponent {
  readonly state$ = this.store.state$;
  constructor(private readonly store: StoreService) {}
}
