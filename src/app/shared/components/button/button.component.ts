import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  BUTTON_BASE_CLASSES,
  BUTTON_SIZE_CLASSES,
  BUTTON_VARIANT_CLASSES,
  type ButtonSize,
  type ButtonType,
  type ButtonVariant
} from './button.styles';

export type { ButtonSize, ButtonType, ButtonVariant } from './button.styles';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex max-w-full',
    '[class.w-full]': 'fullWidth()'
  }
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('contained');
  readonly size = input<ButtonSize>('medium');
  readonly type = input<ButtonType>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly className = input('');
  readonly active = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly title = input<string | undefined>(undefined);

  readonly classes = computed(() => {
    const classes = [
      BUTTON_BASE_CLASSES,
      BUTTON_VARIANT_CLASSES[this.variant()],
      BUTTON_SIZE_CLASSES[this.size()],
      'w-full',
      this.active() ? 'active' : '',
      this.className()
    ];
    return classes.filter(Boolean).join(' ');
  });
}
