import React, {FC, useRef, useState, useCallback} from 'react';
import {Image, Keyboard, StyleSheet, Text, View} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {logo} from '~/assets/images';
import {Button, Header, ScreenContainer} from '~/components';
import {Colors} from '~/styles';
import {useAuthContext} from '~/context/AuthContext';
import {isEmailValid, showAlert} from '~/utils';
import {PrinterConfig} from '~/types';
import {defaultConfig, print} from '~/native_modules/PosPrinter';
import moment from 'moment';

export interface Props {}

const Login: FC<Props> = ({}) => {
  const {login, onLoginSuccess} = useAuthContext();

  const passwordTextInpurRef = useRef<TextInput>();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [printerDpi, setPrinterDpi] = useState('');
  const [printerWidthMM, setPrinterWidthMM] = useState('');
  const [printerNbrCharactersPerLine, setPrinterNbrCharactersPerLine] =
    useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

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

  const onPrintPressed = useCallback(async () => {
    const numRegex = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;

    const _dpi = printerDpi.trim();
    const _widthMM = printerWidthMM.trim();
    const _charactersPerLine = printerNbrCharactersPerLine.trim();
    const _expenseAmount = expenseAmount.trim() || 100;

    const config: PrinterConfig = {
      ...defaultConfig,
    };

    if (_dpi && numRegex.test(_dpi)) {
      config.printerDpi = parseFloat(_dpi);
    }
    if (_widthMM && numRegex.test(_widthMM)) {
      config.printerWidthMM = parseFloat(_widthMM);
    }
    if (_charactersPerLine && numRegex.test(_charactersPerLine)) {
      config.printerNbrCharactersPerLine = parseFloat(_charactersPerLine);
    }

    const textToPrinted =
      "[C]<u><font size='big'>Norsa N.V.</font></u>\n" +
      '[L]\n' +
      `[C]Receipt N.O: ${(Math.random() * 1000).toFixed(0)}\n` +
      `[C]${moment().format('DD/MM/YYYY hh:mm:ss A')}\n` +
      `[L]\n` +
      '[C]================================\n' +
      '[L]\n' +
      `[L]Expense Amount :[R]NAFL ${_expenseAmount}\n` +
      '[L]\n' +
      '[C]================================\n' +
      '[L]\n' +
      "[L]<font size='tall'>Merchant :</font>\n" +
      '[L]Jake Gill\n' +
      "[L]<font size='tall'>Customer :</font>\n" +
      `[L]${'Max'} ${'Norton'}\n` +
      `[L]${'123'}\n` +
      `[L]\n` +
      `[L]<font size='tall'>Signature :</font>\n` +
      `[L]\n` +
      `[L]\n` +
      `[L]\n` +
      `[L]\n` +
      `[L]Thank you for your purchase\n` +
      `[L]For questions or inquiries call customer service : +5999 767-1563`;

    try {
      await print(textToPrinted, config);
    } catch (error) {
      console.log('Error Printing', error);
      showAlert('Error', error.message);
    }
  }, [printerDpi, printerWidthMM, printerNbrCharactersPerLine, expenseAmount]);
  const onClearAllPressed = useCallback(() => {
    setPrinterDpi('');
    setPrinterWidthMM('');
    setPrinterNbrCharactersPerLine('');
    setExpenseAmount('');
  }, []);

  return (
    <ScreenContainer style={styles.container}>
      {/* <View style={styles.contentContainer}>
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
      </View> */}
      <Header title="Printer Config" />
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.seprator} />
        <Text style={styles.titleText}>Printer Dpi</Text>
        <Text style={styles.desc}>DPI of the connected printer</Text>
        <View style={styles.seprator} />
        <TextInput
          value={printerDpi}
          onChangeText={setPrinterDpi}
          style={styles.input}
          placeholder="Default value: 203"
          keyboardType="numeric"
        />
        <View style={styles.seprator} />
        <Text style={styles.titleText}>Printer Width MM</Text>
        <Text style={styles.desc}>
          Printing width in millimeters (can be in decimal points)
        </Text>
        <View style={styles.seprator} />
        <TextInput
          value={printerWidthMM}
          onChangeText={setPrinterWidthMM}
          style={styles.input}
          placeholder="Default value: 48"
          keyboardType="numeric"
        />
        <View style={styles.seprator} />
        <Text style={styles.titleText}>Nbr Characters Per Line</Text>
        <Text style={styles.desc}>
          The maximum number of medium sized characters that can be printed on a
          line
        </Text>
        <View style={styles.seprator} />
        <TextInput
          value={printerNbrCharactersPerLine}
          onChangeText={setPrinterNbrCharactersPerLine}
          style={styles.input}
          placeholder="Default value: 32"
          keyboardType="numeric"
        />
        <View style={styles.seprator} />
        <Text style={styles.titleText}>Expense Amount</Text>
        <View style={styles.seprator} />
        <TextInput
          value={expenseAmount}
          onChangeText={setExpenseAmount}
          style={styles.input}
          placeholder="Default value: 100"
          keyboardType="numeric"
        />
        <View style={styles.seprator} />
        <Button title="Print" onPress={onPrintPressed} />
        <View style={styles.seprator} />
        <Button title="Clear All" onPress={onClearAllPressed} />
      </KeyboardAwareScrollView>
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

  // For Testing only

  scroll: {
    width: '90%',
    alignSelf: 'center',
  },
  scrollContentContainer: {},
  titleText: {
    color: Colors.black,
    fontWeight: 'bold',
    fontSize: responsiveFontSize(2.5),
  },
  desc: {
    marginTop: responsiveHeight(0.5),
    color: Colors.border,
    fontSize: responsiveFontSize(1.8),
  },
  seprator: {
    marginVertical: responsiveHeight(1),
  },
});

export default Login;
