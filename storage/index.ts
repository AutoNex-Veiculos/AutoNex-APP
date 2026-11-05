import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEY = 'autonex.token';

const hasLocalStorage = () => typeof localStorage !== 'undefined';

// SecureStore no mobile; localStorage na versão web.
export const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return hasLocalStorage() ? localStorage.getItem(key) : null;
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (hasLocalStorage()) localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (hasLocalStorage()) localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
