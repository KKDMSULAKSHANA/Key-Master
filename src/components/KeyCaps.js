import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getShortcutAccessibilityLabel, getVisibleKeyLabel } from '../utils/keyLabels';

export function KeyCaps({ keys = [], system = 'Windows', size = 'small' }) {
  const { theme } = useTheme();
  const large = size === 'large';

  if (!Array.isArray(keys) || keys.length === 0) {
    return <Text style={[styles.unavailable, { color: theme.muted }]}>Not available on {system}</Text>;
  }

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={getShortcutAccessibilityLabel(keys)}
      style={styles.row}
    >
      {keys.map((key, index) => (
        <View key={`${key}-${index}`} style={styles.keyGroup}>
          <View
            style={[
              styles.keycap,
              large ? styles.largeKeycap : styles.smallKeycap,
              { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
            ]}
          >
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              numberOfLines={1}
              style={[styles.keyText, large ? styles.largeText : styles.smallText, { color: theme.text }]}
            >
              {getVisibleKeyLabel(key, system)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  keyGroup: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  keycap: {
    alignItems: 'center', borderRadius: 8, borderWidth: 1,
    borderBottomWidth: 3, justifyContent: 'center', maxWidth: '100%',
  },
  smallKeycap: { minHeight: 34, minWidth: 34, paddingHorizontal: 8 },
  largeKeycap: { minHeight: 48, minWidth: 48, paddingHorizontal: 12 },
  keyText: { fontFamily: 'monospace', fontWeight: '700' },
  smallText: { fontSize: 13 },
  largeText: { fontSize: 16 },
  unavailable: { fontSize: 14 },
});
