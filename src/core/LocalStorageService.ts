import AsyncStorage from '@react-native-async-storage/async-storage';
import {asyncStorageKeys} from '../constants/index';
import {LoginData} from '~/types';

export const getLoginData: () => Promise<LoginData | null> = async () => {
  try {
    const loginDataJson = await AsyncStorage.getItem(
      asyncStorageKeys.loginData,
    );

    if (loginDataJson) {
      const loginData = JSON.parse(loginDataJson) as LoginData;
      return loginData;
    } else {
      return null;
    }
  } catch (error) {
    console.log('Error getting login data from async storage', error);
    return null;
  }
};

export const setLoginData: (
  loginData: LoginData,
) => Promise<void> = async loginData => {
  try {
    await AsyncStorage.setItem(
      asyncStorageKeys.loginData,
      JSON.stringify(loginData),
    );
  } catch (error) {
    console.log('Error setting login data', error);
  }
};

export const clearLoginData: () => Promise<void> = async () => {
  try {
    await AsyncStorage.removeItem(asyncStorageKeys.loginData);
  } catch (error) {
    console.log('Error clearing login data', error);
  }
};
