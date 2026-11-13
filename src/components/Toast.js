import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export function Toast({ message, onDismiss }) {
  const { theme } = useTheme();

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onDismiss, 2200);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;
  return (
    <View accessibilityLiveRegion="polite" style={[styles.toast, { backgroundColor: theme.text }]}>
      <Ionicons name="checkmark-circle" size={18} color={theme.success} />
      <Text style={[styles.text, { color: theme.background }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: { alignItems: 'center', alignSelf: 'center', borderRadius: 12, bottom: 18, flexDirection: 'row', gap: 8, maxWidth: 520, minHeight: 46, paddingHorizontal: 16, position: 'absolute' },
  text: { fontSize: 14, fontWeight: '600' },
});
