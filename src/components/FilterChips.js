import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function FilterChips({ items, selected, onSelect, accessibilityPrefix = 'Filter by app' }) {
  const { theme } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((item) => {
        const active = Array.isArray(selected) ? selected.includes(item) : selected === item;
        return (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityLabel={`${accessibilityPrefix}: ${item}`}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(item)}
            style={[
              styles.chip,
              { backgroundColor: active ? theme.primary : theme.surface, borderColor: active ? theme.primary : theme.border },
            ]}
          >
            <Text style={[styles.label, { color: active ? theme.onPrimary : theme.text }]}>{item}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', gap: 8, paddingRight: 4 },
  chip: { alignItems: 'center', borderRadius: 18, borderWidth: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: 14 },
  label: { fontSize: 13, fontWeight: '600' },
});
