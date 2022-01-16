import Axios, {AxiosResponse} from 'axios';
import {authEndpoints, BASE_URL} from '~/constants';
import {LoginApiRequest, LoginApiResponse, LoginResponse} from '~/types';
import {AxiosError} from '../../node_modules/axios/index.d';

const axios = Axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': ' application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

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
