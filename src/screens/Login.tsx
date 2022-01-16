import React, {FC, useRef, useState, useCallback} from 'react';
import {Image, Keyboard, StyleSheet, View} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import {logo} from '~/assets/images';
import {Button, ScreenContainer} from '~/components';
import {Colors} from '~/styles';
import {useAuthContext} from '~/context/AuthContext';
import {isEmailValid, showAlert} from '~/utils';

export interface Props {}

const Login: FC<Props> = ({}) => {
  const {login, onLoginSuccess} = useAuthContext();

  const passwordTextInpurRef = useRef<TextInput>();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onEmailTextChange = useCallback((text: string) => setEmail(text), []);
  const onPasswordTextChange = useCallback(
    (text: string) => setPassword(text),
    [],
  );
  const onUsernameEndEditing = useCallback(() => {
    passwordTextInpurRef.current.focus();
  }, []);
  const onLoginPressed = useCallback(async () => {
    Keyboard.dismiss();

    const _email = email.trim();
    const _password = password.trim();

    if (_email === '') {
      showAlert('Email Empty', 'Please enter an email.');
      return;
    }

    if (!isEmailValid(_email)) {
      showAlert('Invalid Email', 'The email entered is invalid.');
      return;
    }

    if (_password === '') {
      showAlert('Password Empty', 'Please enter a password.');
      return;
    }

    if (_password.length < 8) {
      showAlert('Invalid Password', 'The password must be 8 characters long.');
      return;
    }

    setLoading(true);
    const loginResponse = await login(_email, _password);
    console.log(loginResponse);

    if (loginResponse.data) {
      onLoginSuccess(loginResponse.data);
    } else {
      setLoading(false);
      showAlert('Error', loginResponse.message);
    }
  }, [email, password]);

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.contentContainer}>
        <Image source={logo} style={styles.logo} />
        <TextInput
          style={styles.input}
          value={email}
          placeholder="Email"
          onEndEditing={onUsernameEndEditing}
          onChangeText={onEmailTextChange}
          keyboardType="email-address"
          returnKeyType="next"
        />
        <View style={styles.inputsSeprator} />
        <TextInput
          ref={passwordTextInpurRef}
          style={styles.input}
          value={password}
          placeholder="Password"
          secureTextEntry
          onChangeText={onPasswordTextChange}
          returnKeyType="done"
        />
        <Button
          style={styles.loginBtn}
          title="Login"
          loading={loading}
          onPress={onLoginPressed}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
  },
  contentContainer: {
    marginTop: responsiveHeight(4),
    width: '80%',
    alignItems: 'center',
  },
  logo: {
    height: responsiveWidth(60),
    width: responsiveWidth(60),
    marginBottom: responsiveHeight(2),
  },
  input: {
    borderWidth: responsiveWidth(0.3),
    borderColor: Colors.border,
    borderRadius: responsiveWidth(50) / 8,
    width: '100%',
    padding: responsiveFontSize(1.5),
  },
  inputsSeprator: {
    marginVertical: responsiveHeight(1.5),
  },
  loginBtn: {
    marginTop: responsiveHeight(4),
  },
});

export default Login;
