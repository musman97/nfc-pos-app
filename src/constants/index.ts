import {AppMode} from '~/types';

export const BASE_URL = 'https://norsabackend.herokuapp.com/api/';

export const authEndpoints = {
  login: 'auth/login',
};

export const mainEndpoints = {
  getIssuanceHistory: 'issuancehistory/OnNfcAndPinCode',
  getMultipleIssuanceHistories: 'issuancehistory/OnNfcAndPinCodeMI',
  getClient: (clientId: string) => `clients/getClientById/${clientId}`,
  createTransactionHistory: 'transactionHistory/createTransactionHistory',
  getMerchantId: (userId: string) =>
    `auth/getMerchantIdForLoggedInUser/${userId}`,
  getDailyTransactions: 'transactionHistory/getMerchantsTodaysTransactions',
  getMerchantName: 'merchants/getMerchantNameByUserId',
  getDailySalesPrintCheck: (merchantId: string) =>
    `dailySalesPrintCheck/getByMerchantId/${merchantId}`,
  postDailySalesPrintCheck: (merchantId: string) =>
    `dailySalesPrintCheck/update/${merchantId}`,
};

export const asyncStorageKeys = {
  loginData: 'KEY_LOGIN_DATA',
  dailyReportPrintedDate: 'KEY_DAILY_REPORT_PRRINTED_DATE',
  printerDefaultConfig: 'KEY_PRINTER_DEFAULT_CONFIG',
  previousPrintedReceipt: 'KEY_PREVIOUS_PRINTED_RECEIPT',
};

export const appModes: AppMode = 'expense-retour';
