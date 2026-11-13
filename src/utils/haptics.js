import * as Haptics from 'expo-haptics';

export async function playAnswerHaptic(enabled, correct) {
  if (!enabled) return;
  try {
    await Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    );
  } catch {
    return;
  }
}

export async function playSelectionHaptic(enabled) {
  if (!enabled) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    return;
  }
}
