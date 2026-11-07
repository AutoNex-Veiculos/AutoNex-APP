import type { ReactNode } from 'react';
import type { TextInputProps } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { TextField } from '@/components/ui/TextField';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { OptionPicker, type PickerOption } from '@/components/ui/OptionPicker';
import { Checkbox } from '@/components/ui/Checkbox';

type Base<T extends FieldValues> = { control: Control<T>; name: Path<T>; label: string };

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  ...rest
}: Base<T> & Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'>): ReactNode {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <TextField label={label} value={String(value ?? '')} onChangeText={onChange} onBlur={onBlur} error={error?.message} {...rest} />
      )}
    />
  );
}

export function FormChips<T extends FieldValues>({
  control,
  name,
  label,
  options,
}: Base<T> & { options: { value: string; label: string }[] }): ReactNode {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => <ChipGroup label={label} options={options} value={String(value)} onChange={onChange} />}
    />
  );
}

export function FormPicker<T extends FieldValues>({
  control,
  name,
  label,
  options,
  emptyText,
}: Base<T> & { options: PickerOption[]; emptyText?: string }): ReactNode {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <OptionPicker label={label} options={options} value={String(value ?? '')} onChange={onChange} error={error?.message} emptyText={emptyText} />
      )}
    />
  );
}

export function FormCheck<T extends FieldValues>({ control, name, label }: Base<T>): ReactNode {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => <Checkbox label={label} checked={Boolean(value)} onChange={onChange} />}
    />
  );
}
