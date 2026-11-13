import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';

export function ConfirmDialog({ visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false, onConfirm, onCancel }) {
  const { theme } = useTheme();
  const actionColor = destructive ? theme.danger : theme.primary;

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={[styles.dialog, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.muted }]}>{message}</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" accessibilityLabel={cancelLabel} onPress={onCancel} style={[styles.button, { borderColor: theme.border }]}>
              <Text style={[styles.buttonText, { color: theme.text }]}>{cancelLabel}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={confirmLabel} onPress={onConfirm} style={[styles.button, styles.confirm, { backgroundColor: actionColor }]}>
              <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.48)', flex: 1, justifyContent: 'center', padding: spacing.md },
  dialog: { borderRadius: 16, borderWidth: 1, gap: spacing.sm, maxWidth: 420, padding: spacing.lg, width: '100%' },
  title: { fontSize: 20, fontWeight: '700' },
  message: { fontSize: 14, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end', marginTop: spacing.sm },
  button: { alignItems: 'center', borderRadius: 10, borderWidth: 1, justifyContent: 'center', minHeight: 46, minWidth: 100, paddingHorizontal: spacing.md },
  confirm: { borderWidth: 0 },
  buttonText: { fontSize: 14, fontWeight: '700' },
});
