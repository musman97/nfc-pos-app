import Axios, {AxiosError, AxiosInstance, AxiosResponse} from 'axios';
import {authEndpoints, BASE_URL, mainEndpoints} from '~/constants';
import {
  GetClientApiResponse,
  GetClientResponse,
  GetIssuanceHistoryApiResponse,
  GetIssuanceHistoryResponse,
  LoginApiRequest,
  LoginApiResponse,
  LoginResponse,
} from '~/types';
import {getAuthToken} from './LocalStorageService';

const axios = Axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': ' application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

const getAxiosInstanceWithAuthHeader: () => Promise<AxiosInstance> =
  async () => {
    const authToken = await getAuthToken();

    const _axios = Axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': ' application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      timeout: 15000,
    });

    return _axios;
  };

export const doLogin = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    const response = await axios.post<
      LoginApiResponse,
      AxiosResponse<LoginApiResponse, LoginApiRequest>,
      LoginApiRequest
    >(authEndpoints.login, {email, password});

    return {
      data: response.data?.data,
    };
  } catch (error) {
    if (Axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<LoginApiResponse, LoginApiRequest>;
      console.log('Axios error: ', axiosError?.response?.data ?? axiosError);

      if (axiosError.response.status === 400) {
        return {
          message: 'email or password is incorrect',
        };
      }

      return {
        message: axiosError?.response?.data?.message ?? 'Something went wrong',
      };
    } else {
      console.log('Error Sending login request: ', error);

      return {
        message: error?.message ?? 'Something went wrong',
      };
    }
  }
};

export const doGetIssuanceHistory: (
  pincode: string,
  cardId: string,
) => Promise<GetIssuanceHistoryResponse> = async (pincode, cardId) => {
  try {
    const axios = await getAxiosInstanceWithAuthHeader();

    const response = await axios.get<
      GetIssuanceHistoryApiResponse,
      AxiosResponse<GetIssuanceHistoryApiResponse>
    >(mainEndpoints.getIssuanceHistory(pincode, cardId));

    return {
      data: response.data[0],
    };
  } catch (error) {
    console.log('Error Getting Issuance Histroy: ', error);

    return {
      message: 'Something went wrong',
    };
  }
};

export const doGetClient: (
  clientId: string,
) => Promise<GetClientResponse> = async clientId => {
  try {
    const axios = await getAxiosInstanceWithAuthHeader();

    const response = await axios.get<
      GetClientApiResponse,
      AxiosResponse<GetClientApiResponse>
    >(mainEndpoints.getClient(clientId));

    return {
      data: response.data,
    };
  } catch (error) {
    console.log('Error Getting Client: ', error);

    return {
      message: 'Something went wrong',
    };
  }
};
