import { booleanAttribute, ChangeDetectionStrategy, Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  FIELD_CONTROL_CLASSES,
  FIELD_CONTROL_ERROR_CLASSES,
  FIELD_ERROR_CLASSES,
  FIELD_LABEL_CLASSES
} from '../input/input.styles';
import { SelectOption } from './select.models';

let nextId = 0;

@Component({
  selector: 'app-select',
  standalone: true,
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'min-w-0',
    '[class.block]': '!inline()',
    '[class.w-full]': '!inline()',
    '[class.inline-flex]': 'inline()',
    '[class.w-auto]': 'inline()'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly value = input<string | number>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly error = input('');
  readonly options = input<readonly SelectOption[]>([]);
  readonly inline = input(false, { transform: booleanAttribute });
  readonly className = input('');
  readonly labelClass = input('');
  readonly valueChange = output<string | number>();

  readonly fieldId = `app-select-${++nextId}`;
  readonly labelClasses = computed(() => this.labelClass() || (this.inline() ? 'text-[.78rem] text-ink' : FIELD_LABEL_CLASSES));
  readonly errorClasses = FIELD_ERROR_CLASSES;
  private readonly written = signal<string | number | undefined>(undefined);
  private readonly cvaDisabled = signal(false);
  private onChange: (value: string | number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly currentValue = computed(() => this.written() ?? this.value());
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly wrapperClasses = computed(() =>
    this.inline()
      ? 'inline-flex w-auto items-center gap-2'
      : 'grid w-full min-w-0 gap-[7px]'
  );
  readonly controlClasses = computed(() =>
    [
      FIELD_CONTROL_CLASSES,
      this.error() ? FIELD_CONTROL_ERROR_CLASSES : '',
      this.className()
    ].filter(Boolean).join(' ')
  );

  writeValue(value: string | number | null): void {
    this.written.set(value ?? '');
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  onSelect(event: Event): void {
    const next = (event.target as HTMLSelectElement).value;
    this.written.set(next);
    this.valueChange.emit(next);
    this.onChange(next);
  }

  markTouched(): void {
    this.onTouched();
  }
}
