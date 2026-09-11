export type ButtonVariant = 'contained' | 'outlined' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonType = 'button' | 'submit' | 'reset';

export const BUTTON_BASE_CLASSES =
  'inline-flex max-w-full cursor-pointer items-center justify-center gap-2 rounded-[5px] border border-solid text-center font-[inherit] leading-none';

export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  contained: 'border-brand bg-brand font-extrabold text-surface',
  outlined: 'border-brand bg-surface font-bold text-brand',
  text: 'border-transparent bg-transparent font-bold text-brand'
};

export const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  small: 'px-2.5 py-[7px] text-[11px]',
  medium: 'px-[14px] py-2.5',
  large: 'px-[18px] py-3 text-sm'
};
