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
  id?: string;
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

export type GeneralFailureResponse = {
  message?: string;
};

export type LoginResponse = LoginSuccessResponse & GeneralFailureResponse;

export type IssuanceHistory = {
  id: string;
  Client_id: string;
  Pincode: string;
  DateTime: string;
  Amount: string;
  AmountPaid: string;
  TypeOfReturnPayment: string;
  DateDeposit: string;
  NfcCard_id: string;
};

export type GetIssuanceHistoryApiResponse = Array<IssuanceHistory>;

export type GetIssuanceHistorySuccessResponse = {
  data?: IssuanceHistory;
};

export type GetIssuanceHistoryResponse = GetIssuanceHistorySuccessResponse &
  GeneralFailureResponse;

export type Client = {
  id: string;
  Code: string;
  Date: string;
  ExpiryDate: string;
  FirstName: string;
  LastName: string;
  idCard: string;
  Status: number;
  ChildrenCount: number;
  Email: string;
  ContactNo: string;
  WorkNo: string;
  WorksAt: string;
  FaxNumber: string;
  Partner?: object;
  Housing: number;
  NameOfPartner?: string;
  address: string;
  MaxBorrowAmount: number;
  Dealer_id: string;
  SourceOfIncome: string;
  RecievedCreditInPast: number;
};

export type GetClientApiResponse = Client | null;

export type GetClientSuccessResponse = {
  data?: Client;
};

export type GetClientResponse = GetClientSuccessResponse &
  GeneralFailureResponse;

export type CreateTransactionHistoryApiResponse = {
  message?: string;
};

export type Transaction = {
  Client_id: string;
  Merchant_ID: string;
  IssuanceHistoryId: string;
  ItemDescription: 'Expense';
  dateTime: string;
  AmountUser: number;
};

export type CreateTransactionHistoryResponse = {
  success: boolean;
  message?: string;
};

export type MerchantId = {
  id?: string;
};

export type GetMerchantIdApiResponse = {
  success?: string;
  data?: Array<MerchantId>;
};

export type GetMerchantIdSuccessResponse = {
  data?: string;
};

export type GetMerchantIdResponse = GetMerchantIdSuccessResponse &
  GeneralFailureResponse;

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
  [routeNames.PrintExpense]: {
    client: Client;
    balance: number;
    cardId: string;
    merchantId: string;
    issuanceHistoryId: string;
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
  routeNames.PrintExpense
>;
