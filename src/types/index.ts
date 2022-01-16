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

// Api Requests and Responses

export type LoginData = {
  id: string;
  accessToken?: string;
  refreshToken?: string;
  dormantUser?: number;
  isAdmin?: number;
};

export type LoginApiRequest = {
  email: string;
  password: string;
};

export type LoginApiResponse = {
  result?: string;
  message?: string;
  data?: LoginData;
};

export type LoginSuccessResponse = {
  data?: LoginData;
};

export type LoginFailureResponse = {
  message?: string;
};

export type LoginResponse = LoginSuccessResponse & LoginFailureResponse;

// Context

export type AuthContext = {
  isLoading: boolean;
  isLoggedIn: boolean;
  loginData: LoginData | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  onLoginSuccess: (data: LoginData) => void;
  checkUserSession: () => Promise<void>;
};

export type AuthContextValue = AuthContext | undefined;

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
