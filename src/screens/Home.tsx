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
import {doGetClient, doGetIssuanceHistory} from '~/core/ApiService';
import {
  checkIfNfcEnabled,
  cleanUpReadingListners,
  cleanUpWriteRequest,
  initNfcManager,
  readNfcTag,
  writeNfcTag,
} from '~/core/NfcReaderWriter';
import {routeNames} from '~/navigation/routeNames';
import {Colors} from '~/styles';
import {HomeScreenNavProp, NfcTagOperationStatus} from '~/types';
import {showToast} from '~/utils';
import {isValidIntNumber} from '../utils/index';

export interface Props {
  navigation: HomeScreenNavProp;
}

const Home: FC<Props> = ({navigation: {navigate}}) => {
  const [loading, setLoading] = useState(false);
  const [writeNfcTagLoading, setWriteNfcTagLoading] = useState(false);
  const [bottomModalShown, setBottomModalShown] = useState(false);
  const [writeBottomModalShown, setWriteBottomModalShown] = useState(false);
  const [scanningStatus, setScanningStatus] =
    useState<NfcTagOperationStatus>('scanning');
  const [writeNfcTagStatus, setWriteNfcTagStatus] =
    useState<NfcTagOperationStatus>('none');
  const [writeNfcError, setWriteNfcError] = useState('');
  const [error, setError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardNumberToBeWritten, setCardNumberToBeWritten] = useState('');
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

  const writeTag = useCallback(async () => {
    try {
      setWriteNfcTagStatus('scanning');
      console.log(`Writing user id: ${cardNumberToBeWritten} on nfc tag`);
      const writingResult = await writeNfcTag(cardNumberToBeWritten);
      console.log('Write Nfc Tag Result', writingResult);

      if (writingResult.success) {
        showToast('Data was Successfully Written');
        hideWriteNfcBottomModal();
      } else {
        setWriteNfcError(writingResult.error);
        setWriteNfcTagStatus('error');
      }
    } catch (error) {
      console.log('Error Writing Nfc', error);
    }
  }, [cardNumberToBeWritten]);

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

  const hideBottomModal = useCallback(() => {
    cleanUpReadingListners();
    setBottomModalShown(false);
  }, []);

  const showWriteNfcBottomModal = useCallback(async () => {
    try {
      setWriteNfcTagLoading(true);
      const isEnabled = await checkIfNfcEnabled();
      setWriteNfcTagLoading(false);

      if (isEnabled) {
        setWriteNfcTagStatus('none');
        setWriteBottomModalShown(true);
      } else {
        Alert.alert(
          'NFC Disabled',
          'Nfc is disabled. Please enable Nfc and try again',
        );
      }
    } catch (error) {
      console.log('Error Checking nfc status');
    }
  }, []);

  const hideWriteNfcBottomModal = useCallback(() => {
    cleanUpWriteRequest();
    setWriteBottomModalShown(false);
    setCardNumberToBeWritten('');
  }, []);

  const onScanNfcPressed = useCallback(() => {
    showBottomModal();
  }, []);

  const onWriteUserIdPressed = useCallback(() => {
    if (cardNumberToBeWritten === '') {
      showToast('Card Number cannot be empty');
    } else {
      writeTag();
    }
  }, [cardNumberToBeWritten]);

  const onWriteNfcPressed = useCallback(() => {
    showWriteNfcBottomModal();
  }, []);

  const onTryAgainPressed = useCallback(() => {
    readTag();
  }, []);

  const onWriteTryAgainPressed = useCallback(() => {
    setCardNumberToBeWritten('');
    setWriteNfcTagStatus('none');
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

    console.log(issuanceHistoryRes);

    if (issuanceHistoryRes?.data) {
      const clientRes = await doGetClient(issuanceHistoryRes?.data?.Client_id);

      if (clientRes?.data) {
        setGetClientLoading(false);
        hideBottomModal();

        setPinCode('');
        navigate(routeNames.PrintExpense, {
          client: clientRes?.data,
          balance: parseFloat(issuanceHistoryRes?.data?.Amount),
          cardId: cardNumber,
        });
      } else {
        setGetClientLoading(false);
        showToast(clientRes?.message);
      }
    } else {
      console.log('here');
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

  const renderWriteNfcScanning = useCallback(() => {
    return (
      <View style={styles.nfcContentContainer}>
        <ActivityIndicator animating color={Colors.primary} size="large" />
        <Text style={styles.scanningNfcText}>
          Scanning Nearby NFC card to write data
        </Text>
      </View>
    );
  }, []);

  const renderWriteUserIdContent = useCallback(() => {
    return (
      <View style={styles.nfcContentContainer}>
        <Text style={styles.inputUserIdText}>Enter Card Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Card Number"
          value={cardNumberToBeWritten}
          onChangeText={setCardNumberToBeWritten}
        />
        <Button
          style={styles.writeNfcTagBtn}
          title="Write Card Number"
          onPress={onWriteUserIdPressed}
        />
      </View>
    );
  }, [cardNumberToBeWritten]);

  const renderTryAgain = useCallback(() => {
    return (
      <View style={styles.nfcContentContainer}>
        <Text style={styles.tryAgainText}>{error}</Text>
        <Button title="Try Again" onPress={onTryAgainPressed} />
      </View>
    );
  }, [error]);

  const renderWriteTagTryAgain = useCallback(() => {
    return (
      <View style={styles.nfcContentContainer}>
        <Text style={styles.tryAgainText}>{writeNfcError}</Text>
        <Button title="Try Again" onPress={onWriteTryAgainPressed} />
      </View>
    );
  }, [writeNfcError]);

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

  const renderWriteNfcModalContent = useCallback(() => {
    if (writeNfcTagStatus === 'none') {
      return renderWriteUserIdContent();
    } else if (writeNfcTagStatus === 'scanning') {
      return renderWriteNfcScanning();
    } else if (writeNfcTagStatus === 'error') {
      return renderWriteTagTryAgain();
    } else {
      return null;
    }
  }, [writeNfcTagStatus, cardNumberToBeWritten]);

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
          {/* <Button
            title="Write NFC card"
            style={styles.scanNfcBtn}
            loading={writeNfcTagLoading}
            onPress={onWriteNfcPressed}
          /> */}
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
      <BottomModal visible={writeBottomModalShown}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeBottomModalBtn}
            onPress={hideWriteNfcBottomModal}>
            <Icons.MaterialIcons
              name="close"
              color={Colors.black}
              size={responsiveFontSize(4)}
            />
          </TouchableOpacity>
          {renderWriteNfcModalContent()}
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
    width: '50%',
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
  writeNfcTagBtn: {
    marginTop: responsiveHeight(2),
    width: '60%',
  },
  submitPinCodeBtn: {
    marginTop: responsiveHeight(2),
    width: '60%',
  },
});

export default Home;
