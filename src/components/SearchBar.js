import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function SearchBar({ value, onChangeText, onFocus, onSubmitEditing }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Ionicons name="search-outline" size={20} color={theme.muted} />
      <TextInput
        accessibilityLabel="Search shortcuts"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onSubmitEditing={onSubmitEditing}
        placeholder="Search by action, key or app"
        placeholderTextColor={theme.muted}
        returnKeyType="search"
        style={[styles.input, { color: theme.text }]}
        value={value}
      />
      {!!value && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          onPress={() => onChangeText('')}
          style={styles.clearButton}
        >
          <Ionicons name="close-circle" size={20} color={theme.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 50, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 15, minHeight: 48, paddingVertical: 8 },
  clearButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 44 },
});
