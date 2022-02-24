export const BASE_URL = 'https://norsabackend.herokuapp.com/api/';

export const authEndpoints = {
  login: 'auth/login',
};

export const mainEndpoints = {
  getIssuanceHistory: 'issuancehistory/OnNfcAndPinCode',
  getClient: (clientId: string) => `clients/getClientById/${clientId}`,
  createTransactionHistory: 'transactionHistory/createTransactionHistory',
  getMerchantId: (userId: string) =>
    `auth/getMerchantIdForLoggedInUser/${userId}`,
  getDailyTransactions: 'transactionHistory/getMerchantsTodaysTransactions',
  getMerchantName: 'merchants/getMerchantNameByUserId',
};

export const asyncStorageKeys = {
  loginData: 'KEY_LOGIN_DATA',
  dailyReportPrintedDate: 'KEY_DAILY_REPORT_PRRINTED_DATE',
  printerDefaultConfig: 'KEY_PRINTER_DEFAULT_CONFIG',
};
