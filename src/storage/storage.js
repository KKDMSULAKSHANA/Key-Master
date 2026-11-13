import AsyncStorage from '@react-native-async-storage/async-storage';

export async function readStorage(key, fallbackValue = null) {
  try {
    const storedValue = await AsyncStorage.getItem(key);
    return storedValue === null ? fallbackValue : JSON.parse(storedValue);
  } catch {
    return fallbackValue;
  }
}

export async function writeStorage(key, value) {
  try {
    const serializedValue = JSON.stringify(value);
    if (typeof serializedValue !== 'string') {
      return false;
    }
    await AsyncStorage.setItem(key, serializedValue);
    return true;
  } catch {
    return false;
  }
}

export async function removeStorage(key) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}