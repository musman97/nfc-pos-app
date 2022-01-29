export const BASE_URL = 'https://norsabackend.herokuapp.com/api/';

export const authEndpoints = {
  login: 'auth/login',
};

export const mainEndpoints = {
  getIssuanceHistory: (pincode: string, cardId: string) =>
    `issuancehistory/getissuancehistoryByPincodeAndNfcCard_id/${pincode}&${cardId}`,
  getClient: (clientId: string) => `clients/getClientById/${clientId}`,
  createTransactionHistory: 'transactionHistory/createTransactionHistory',
  getMerchantId: (userId: string) =>
    `auth/getMerchantIdForLoggedInUser/${userId}`,
};

export const asyncStorageKeys = {
  loginData: 'KEY_LOGIN_DATA',
};
