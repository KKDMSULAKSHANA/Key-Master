import { Component } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text accessibilityRole="header" style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>Restart KeyMaster to continue.</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Restart app"
          onPress={() => this.setState({ hasError: false })}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Restart app</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: { color: '#111827', fontSize: 24, fontWeight: '700', textAlign: 'center' },
  message: { color: '#4B5563', fontSize: 16, marginTop: 12, textAlign: 'center' },
  button: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 48,
    minWidth: 160,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});