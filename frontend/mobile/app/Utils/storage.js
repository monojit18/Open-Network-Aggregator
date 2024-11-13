import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeToken = async (token, key = 'token') => {
  try {
    await AsyncStorage.setItem(key, token);
  } catch (error) {
    console.error(`Error storing token for key ${key}:`, error);
    throw error;
  }
};

export const getToken = async (key = 'token') => {
  try {
    const token = await AsyncStorage.getItem(key);
    return token;
  } catch (error) {
    console.error(`Error getting token for key ${key}:`, error);
    throw error;
  }
};

export const clearToken = async (key = 'token') => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing token for key ${key}:`, error);
    throw error;
  }
};
