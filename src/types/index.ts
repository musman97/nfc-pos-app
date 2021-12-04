import {Dispatch, SetStateAction} from 'react';
import {routeNames} from '~/navigation/routeNames';

// Common

export interface EmptyProps {}
export type NfcTagReadResult = {
  success: boolean;
  error: string;
  userId: string;
};
export type ParseTagResult = {
  success: boolean;
  error: string;
  text: string;
};
export type NfcTagScanningStatus = 'scanning' | 'error' | 'success';

// Context

export interface AuthContextValue {
  isLoading: boolean;
  isLoggedIn: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}

// Navigation

export type SplashStackParamList = {
  [routeNames.Splash]: undefined;
};

export type AuthStackParamList = {
  [routeNames.Login]: undefined;
};

export type MainStackParamList = {
  [routeNames.Home]: undefined;
};

export type RootStackParamList = SplashStackParamList &
  AuthStackParamList &
  MainStackParamList;
