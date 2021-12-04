import React, {FC, useRef, useState, useCallback} from 'react';
import {Image, StyleSheet, View} from 'react-native';
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

export interface Props {}

const Login: FC<Props> = ({}) => {
  const {setIsLoggedIn} = useAuthContext();
  const passwordTextInpurRef = useRef<TextInput>();

  const [loading, setLoading] = useState(false);

  const onEmailEndEditing = useCallback(() => {
    passwordTextInpurRef.current.focus();
  }, []);
  const onLoginPressed = useCallback(() => {
    setLoading(true);
    const tId = setTimeout(() => {
      clearTimeout(tId);
      setIsLoggedIn(true);
    }, 3000);
  }, []);

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.contentContainer}>
        <Image source={logo} style={styles.logo} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          onEndEditing={onEmailEndEditing}
          keyboardType="email-address"
          returnKeyType="next"
        />
        <View style={styles.inputsSeprator} />
        <TextInput
          ref={passwordTextInpurRef}
          style={styles.input}
          placeholder="Password"
          secureTextEntry
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
