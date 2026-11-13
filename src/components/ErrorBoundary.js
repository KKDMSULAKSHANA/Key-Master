import { Component } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export class ErrorBoundary extends Component {
  state = { hasError: false, resetKey: 0 };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return <View key={this.state.resetKey} style={styles.app}>{this.props.children}</View>;
    }

    return (
      <ErrorFallback onRestart={() => this.setState((current) => ({ hasError: false, resetKey: current.resetKey + 1 }))} />
    );
  }
}

function ErrorFallback({ onRestart }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: theme.muted }]}>Restart KeyMaster to continue.</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Restart app"
        onPress={onRestart}
        style={[styles.button, { backgroundColor: theme.primary }]}
      >
        <Text style={[styles.buttonText, { color: theme.onPrimary }]}>Restart app</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1 },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 16, marginTop: 12, textAlign: 'center' },
  button: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 48,
    minWidth: 160,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
});