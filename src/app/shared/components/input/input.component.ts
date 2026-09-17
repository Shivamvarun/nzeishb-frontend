import { booleanAttribute, ChangeDetectionStrategy, Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  FIELD_CONTROL_CLASSES,
  FIELD_CONTROL_ERROR_CLASSES,
  FIELD_ERROR_CLASSES,
  FIELD_LABEL_CLASSES,
  type InputType
} from './input.styles';

let nextId = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  templateUrl: './input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0 w-full' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input<InputType>('text');
  readonly value = input<string | number>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly error = input('');
  readonly className = input('');
  readonly labelClass = input('');
  readonly valueChange = output<string | number>();

  readonly fieldId = `app-input-${++nextId}`;
  readonly labelClasses = computed(() => this.labelClass() || FIELD_LABEL_CLASSES);
  readonly errorClasses = FIELD_ERROR_CLASSES;
  private readonly written = signal<string | number | undefined>(undefined);
  private readonly cvaDisabled = signal(false);
  private onChange: (value: string | number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly currentValue = computed(() => this.written() ?? this.value());
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
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

  onInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    const next = this.type() === 'number'
      ? (Number.isFinite(el.valueAsNumber) ? el.valueAsNumber : 0)
      : el.value;
    this.written.set(next);
    this.valueChange.emit(next);
    this.onChange(next);
  }

  markTouched(): void {
    this.onTouched();
  }
}
