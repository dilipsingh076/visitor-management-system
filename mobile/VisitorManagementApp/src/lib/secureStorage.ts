/**
 * Secure storage module using react-native-keychain for sensitive data.
 * Falls back to AsyncStorage for non-sensitive data or when keychain is unavailable.
 */
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICE_NAME = 'com.vms.visitor-management';
const TOKEN_KEY = 'vms_access_token';
const USER_KEY = 'vms_user_data';

export interface SecureStorageResult {
  success: boolean;
  error?: string;
}

/**
 * Store access token securely in device keychain.
 */
export async function setSecureToken(token: string): Promise<SecureStorageResult> {
  try {
    await Keychain.setGenericPassword(TOKEN_KEY, token, {
      service: SERVICE_NAME,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to store token in keychain:', error);
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      return { success: true };
    } catch (fallbackError) {
      return {
        success: false,
        error: fallbackError instanceof Error ? fallbackError.message : 'Storage failed',
      };
    }
  }
}

/**
 * Retrieve access token from secure storage.
 */
export async function getSecureToken(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });
    if (credentials && credentials.password) {
      return credentials.password;
    }
  } catch (error) {
    console.warn('Keychain access failed, trying AsyncStorage:', error);
  }

  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Remove access token from secure storage.
 */
export async function removeSecureToken(): Promise<SecureStorageResult> {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE_NAME });
  } catch (error) {
    console.warn('Keychain reset failed:', error);
  }

  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Remove failed',
    };
  }
}

/**
 * Store user data (non-sensitive) in AsyncStorage.
 */
export async function setUserData(user: object): Promise<SecureStorageResult> {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Storage failed',
    };
  }
}

/**
 * Retrieve user data from AsyncStorage.
 */
export async function getUserData<T = object>(): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Remove user data from AsyncStorage.
 */
export async function removeUserData(): Promise<SecureStorageResult> {
  try {
    await AsyncStorage.removeItem(USER_KEY);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Remove failed',
    };
  }
}

/**
 * Clear all stored authentication data.
 */
export async function clearAllAuthData(): Promise<SecureStorageResult> {
  const tokenResult = await removeSecureToken();
  const userResult = await removeUserData();

  if (!tokenResult.success || !userResult.success) {
    return {
      success: false,
      error: tokenResult.error || userResult.error,
    };
  }

  return { success: true };
}

/**
 * Check if keychain is available on this device.
 */
export async function isKeychainAvailable(): Promise<boolean> {
  try {
    const result = await Keychain.getSupportedBiometryType();
    return result !== null || true;
  } catch {
    return false;
  }
}
