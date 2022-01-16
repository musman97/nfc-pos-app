import {Alert, ToastAndroid} from 'react-native';

const numberRegex = /^([0-9]+)|([0-9]+.?[0-9]+)$/g;
const emailRegex =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

export const noop: () => void = () => {};

export const showToast: (message: string, duration?: number) => void = (
  message,
  duration = ToastAndroid.SHORT,
) => {
  ToastAndroid.show(message, duration);
};

export const flatListKeyExtractor: (item: any, index: number) => string = (
  _,
  idx,
) => `${idx}-${Math.random()}`;

export const isValidNumber: (value: string) => boolean = value =>
  numberRegex.test(value);

export const isEmailValid: (email: string) => boolean = email =>
  emailRegex.test(email);

export const showAlert: (title: string, message: string) => void = (
  title,
  message,
) => {
  Alert.alert(title, message, [
    {
      text: 'OK',
      onPress: noop,
    },
  ]);
};
