import React, {FC, useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import {Button, Header, Icons, ScreenContainer} from '~/components';
import BottomModal from '~/components/BottomModal';
import {doGetDailyTransactions, doGetIssuanceHistory} from '~/core/ApiService';
import {
  checkIfNfcEnabled,
  cleanUpReadingListners,
  initNfcManager,
  readNfcTag,
} from '~/core/NfcReaderWriter';
import {printDailyReceipt} from '~/core/ReceiptPrinter';
import {routeNames} from '~/navigation/routeNames';
import {Colors} from '~/styles';
import {HomeScreenNavProp, NfcTagOperationStatus} from '~/types';
import {showToast} from '~/utils';

export interface Props {
  navigation: HomeScreenNavProp;
}

const Home: FC<Props> = ({navigation: {navigate}}) => {
  const [loading, setLoading] = useState(false);
  const [dailyReceiptPrintLoading, setDailyReceiptPrintLoading] =
    useState(false);
  const [bottomModalShown, setBottomModalShown] = useState(false);
  const [scanningStatus, setScanningStatus] =
    useState<NfcTagOperationStatus>('scanning');
  const [error, setError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [getClientLoading, setGetClientLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initNfcManager();
        console.log('Nfc Manager Init');
      } catch (error) {
        console.log('Error Initializing Nfc Manager');
      }
    })();
  }, []);

  const readTag = useCallback(async () => {
    try {
      setScanningStatus('scanning');
      const scanningResult = await readNfcTag();
      console.log('Nfc Tag Result', scanningResult);

      if (scanningResult.success) {
        console.log('cardNumber', scanningResult.text);
        setCardNumber(scanningResult.text);
        setScanningStatus('success');
      } else {
        setError(scanningResult.error);
        setScanningStatus('error');
      }
    } catch (error) {
      console.log('Error Reading Nfc', error);
    }
  }, []);

  const showBottomModal = useCallback(async () => {
    try {
      setLoading(true);
      const isEnabled = await checkIfNfcEnabled();
      setLoading(false);
      if (isEnabled) {
        setBottomModalShown(true);
        readTag();
      } else {
        Alert.alert(
          'NFC Disabled',
          'Nfc is disabled. Please enable Nfc and try again',
        );
      }
    } catch (error) {
      console.log('Error checking nfc status', error);
    }
  }, []);

  const clearAllStates = () => {
    setLoading(false);
    setDailyReceiptPrintLoading(false);
    setBottomModalShown(false);
    setScanningStatus('scanning');
    setError('');
    setPinCode('');
    setGetClientLoading(false);
  };

  const hideBottomModal = useCallback(() => {
    cleanUpReadingListners();
    setBottomModalShown(false);
  }, []);

  const onScanNfcPressed = useCallback(() => {
    showBottomModal();
  }, []);

  const onPrintDailyReceiptPressed = useCallback(async () => {
    setDailyReceiptPrintLoading(true);

    const apiResponse = await doGetDailyTransactions();

    if (apiResponse.data) {
      if (apiResponse.data.length === 0) {
        showToast('There are no transactions to be printed');
        setDailyReceiptPrintLoading(false);
        return;
      }

      try {
        await printDailyReceipt(apiResponse.data);
      } catch (error) {
        console.log('Error printing daily Receipt');
        showToast(error.message);
      }
      setDailyReceiptPrintLoading(false);
    } else {
      showToast(apiResponse.message);
      setDailyReceiptPrintLoading(false);
    }
  }, []);

  const onTryAgainPressed = useCallback(() => {
    readTag();
  }, []);

  const onPinCodeTextChange = useCallback(
    (text: string) => setPinCode(text),
    [],
  );

  const onPinCodeSubmitPressed = useCallback(async () => {
    const _pinCode = pinCode.trim();

    if (_pinCode === '') {
      showToast('Enter pincode');
      return;
    }

    Keyboard.dismiss();
    setGetClientLoading(true);
    const issuanceHistoryRes = await doGetIssuanceHistory(pinCode, cardNumber);

    if (issuanceHistoryRes?.data) {
      clearAllStates();

      navigate(routeNames.PrintExpense, {
        client: {
          id: issuanceHistoryRes.data.Client_id,
          code: issuanceHistoryRes.data.clientCode,
          name: issuanceHistoryRes.data.clientName,
        },
        balance: parseFloat(issuanceHistoryRes?.data?.Balance),
        cardId: cardNumber,
        pinCode,
        issuanceHistoryId: issuanceHistoryRes?.data?.id,
      });
    } else {
      setGetClientLoading(false);
      showToast(issuanceHistoryRes?.message);
    }
  }, [pinCode, cardNumber]);

  const renderNfcScanning = useCallback(() => {
    return (
      <View style={styles.nfcContentContainer}>
        <ActivityIndicator animating color={Colors.primary} size="large" />
        <Text style={styles.scanningNfcText}>Scanning Nearby NFC card</Text>
      </View>
    );
  }, []);

  const renderTryAgain = useCallback(() => {
    return (
      <View style={styles.nfcContentContainer}>
        <Text style={styles.tryAgainText}>{error}</Text>
        <Button title="Try Again" onPress={onTryAgainPressed} />
      </View>
    );
  }, [error]);

  const renderNfcTagFound = useCallback(() => {
    return (
      <View style={styles.nfcContentContainer}>
        <Text style={styles.userIdText}>Card Number: {cardNumber}</Text>
        <Text style={styles.scanningNfcText}>Enter PIN Code</Text>
        <TextInput
          style={styles.input}
          value={pinCode}
          onChangeText={onPinCodeTextChange}
          placeholder="PIN Code"
          keyboardType="numeric"
        />
        <Button
          title="Submit"
          loading={getClientLoading}
          onPress={onPinCodeSubmitPressed}
          style={styles.submitPinCodeBtn}
        />
      </View>
    );
  }, [cardNumber, pinCode, getClientLoading]);

  const renderModalContent = useCallback(() => {
    if (scanningStatus === 'scanning') {
      return renderNfcScanning();
    } else if (scanningStatus === 'success') {
      return renderNfcTagFound();
    } else {
      return renderTryAgain();
    }
  }, [scanningStatus, pinCode, getClientLoading]);

  return (
    <ScreenContainer>
      <Header title="Home" hasLogoutButton />
      <View style={styles.f1}>
        <View style={styles.contentContainer}>
          <View style={styles.nfcIconWrapper}>
            <Icons.MaterialIcons
              name="nfc"
              color={Colors.primary}
              size={responsiveWidth(55)}
            />
          </View>
          <Button
            title="Read NFC card"
            style={styles.scanNfcBtn}
            loading={loading}
            onPress={onScanNfcPressed}
          />
          <Button
            loading={dailyReceiptPrintLoading}
            title="Print Daily Receipt"
            style={styles.scanNfcBtn}
            onPress={onPrintDailyReceiptPressed}
          />
        </View>
      </View>
      <BottomModal visible={bottomModalShown}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeBottomModalBtn}
            onPress={hideBottomModal}>
            <Icons.MaterialIcons
              name="close"
              color={Colors.black}
              size={responsiveFontSize(4)}
            />
          </TouchableOpacity>
          {renderModalContent()}
        </View>
      </BottomModal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  contentContainer: {
    alignSelf: 'center',
    marginTop: responsiveHeight(10),
    alignItems: 'center',
    width: '80%',
  },
  nfcIconWrapper: {
    borderWidth: responsiveWidth(0.3),
    borderColor: Colors.primary,
    borderRadius: responsiveWidth(50) / 20,
    padding: responsiveWidth(2),
  },
  scanNfcBtn: {
    marginTop: responsiveHeight(4),
    width: '60%',
  },
  modalContainer: {
    alignSelf: 'center',
    width: '90%',
    paddingVertical: responsiveHeight(2),
  },
  closeBottomModalBtn: {
    alignSelf: 'flex-end',
  },
  nfcContentContainer: {
    alignItems: 'center',
    paddingVertical: responsiveHeight(2),
  },
  scanningNfcText: {
    color: Colors.black,
    marginVertical: responsiveHeight(2),
    fontSize: responsiveFontSize(2.5),
  },
  tryAgainText: {
    color: Colors.black,
    marginBottom: responsiveHeight(3),
    textAlign: 'center',
    fontSize: responsiveFontSize(2.5),
  },
  userIdText: {
    color: Colors.black,
    fontSize: responsiveFontSize(2.5),
  },
  input: {
    borderWidth: responsiveWidth(0.3),
    borderColor: Colors.border,
    width: '100%',
    borderRadius: responsiveWidth(50) / 8,
    padding: responsiveFontSize(1.5),
  },
  inputUserIdText: {
    color: Colors.black,
    marginVertical: responsiveHeight(2),
    fontSize: responsiveFontSize(2.5),
  },
  printDailyReceiptButton: {
    marginTop: responsiveHeight(2),
    width: '60%',
  },
  submitPinCodeBtn: {
    marginTop: responsiveHeight(2),
    width: '60%',
  },
});

export default Home;
