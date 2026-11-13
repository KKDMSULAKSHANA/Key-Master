import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function HintCard({ icon = 'bulb-outline', title, message, onDismiss }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.icon, { backgroundColor: theme.surfaceMuted }]}><Ionicons name={icon} size={19} color={theme.accent} /></View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.message, { color: theme.muted }]}>{message}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss tip" onPress={onDismiss} style={styles.dismiss}>
        <Ionicons name="close" size={18} color={theme.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start', borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: 9, padding: 11 },
  icon: { alignItems: 'center', borderRadius: 9, height: 34, justifyContent: 'center', width: 34 },
  copy: { flex: 1, gap: 3 },
  title: { fontSize: 13, fontWeight: '700' },
  message: { fontSize: 12, lineHeight: 18 },
  dismiss: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 36 },
});
