import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { colors, fonts, radius } from '@/constants/theme';

export interface PickerOption {
  value: string;
  label: string;
  description?: string;
}

interface Props {
  label: string;
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  emptyText?: string;
}

const LIMIT = 6;

// Lista de escolha com busca, para quando há muitas opções (clientes, veículos).
export function OptionPicker({ label, options, value, onChange, error, emptyText = 'Nenhuma opção disponível.' }: Props) {
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();
  const filtered = options.filter((o) => !term || o.label.toLowerCase().includes(term) || o.description?.toLowerCase().includes(term));
  const selected = options.find((o) => o.value === value);
  const shown = [...(selected ? [selected] : []), ...filtered.filter((o) => o.value !== value)].slice(0, LIMIT);

  return (
    <View style={styles.wrap}>
      <Txt variant="label">{label}</Txt>
      {options.length > LIMIT ? (
        <TextInput
          accessibilityLabel={`Buscar: ${label}`}
          placeholder="Buscar"
          placeholderTextColor={colors.inkMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          style={styles.search}
        />
      ) : null}
      {options.length === 0 ? <Txt variant="small">{emptyText}</Txt> : null}
      <View style={styles.list} accessibilityRole="radiogroup">
        {shown.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value || 'none'}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onChange(option.value)}
              style={[styles.option, isSelected && styles.optionSelected]}
            >
              <View style={[styles.dot, isSelected && styles.dotSelected]} />
              <View style={styles.optionText}>
                <Txt variant="label">{option.label}</Txt>
                {option.description ? <Txt variant="caption">{option.description}</Txt> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {filtered.length > shown.length ? <Txt variant="caption">Mostrando {shown.length} de {filtered.length}. Use a busca para refinar.</Txt> : null}
      {error ? (
        <Txt variant="small" color={colors.danger} accessibilityRole="alert">
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  search: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  list: { gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.surface },
  dotSelected: { borderColor: colors.accent, backgroundColor: colors.accent },
  optionText: { flex: 1, gap: 2 },
});
