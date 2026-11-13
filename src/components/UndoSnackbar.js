import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function UndoSnackbar({ message, onUndo, onDismiss }) {
  const { theme } = useTheme();

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;
  return (
    <View accessibilityLiveRegion="polite" style={[styles.container, { backgroundColor: theme.text }]}>
      <Text style={[styles.message, { color: theme.background }]}>{message}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Undo" onPress={onUndo} style={styles.action}>
        <Text style={[styles.actionText, { color: theme.accent }]}>Undo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', alignSelf: 'center', borderRadius: 12, bottom: 16, flexDirection: 'row', gap: 16, justifyContent: 'space-between', maxWidth: 560, minHeight: 52, paddingHorizontal: 16, position: 'absolute', width: '92%' },
  message: { flex: 1, fontSize: 14, fontWeight: '500' },
  action: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 54 },
  actionText: { fontSize: 14, fontWeight: '700' },
});
