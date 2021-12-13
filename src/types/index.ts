import {Dispatch, SetStateAction} from 'react';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {routeNames} from '~/navigation/routeNames';

// Common

export interface PosPrinterInterface {
  print: (textToBePrinted: string) => Promise<boolean>;
}

export interface EmptyProps {}

export type NfcTagReadResult = {
  success: boolean;
  error: string;
  text: string;
};

export type NfcTagWriteResult = {
  success: boolean;
  error: string;
};

export type ParseTagResult = {
  success: boolean;
  error: string;
  text: string;
};

export type NfcTagOperationStatus = 'scanning' | 'error' | 'success' | 'none';

export type Item = {
  name: string;
  price: number;
};

export type Customer = {
  name: string;
  code: string;
};

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
  [routeNames.AddItems]: {
    code: string;
  };
};

export type RootStackParamList = SplashStackParamList &
  AuthStackParamList &
  MainStackParamList;

export type HomeScreenNavProp = StackNavigationProp<
  MainStackParamList,
  routeNames.Home
>;

export type AddItemsScreeProps = StackScreenProps<
  MainStackParamList,
  routeNames.AddItems
>;
