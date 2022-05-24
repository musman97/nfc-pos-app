import moment from 'moment';
import React, {FC, useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import {logo} from '~/assets/images';
import {Button, Header, Icons, Loader, ScreenContainer} from '~/components';
import BottomModal from '~/components/BottomModal';
import {appModes} from '~/constants';
import {useAuthContext} from '~/context/AuthContext';
import {
  doGetDailyTransactions,
  doGetIssuanceHistory,
  doPostDailySalesPrintCheck,
} from '~/core/ApiService';
import {
  getDailyReportPrintedDate,
  getPreviousPrintedReceipt,
  setDailyReportPrintedDate,
} from '~/core/LocalStorageService';
import {
  checkIfNfcEnabled,
  cleanUpReadingListners,
  initNfcManager,
  readNfcTag,
} from '~/core/NfcReaderWriter';
import {printBalance, printDailyReceipt} from '~/core/ReceiptPrinter';
import {routeNames} from '~/navigation/routeNames';
import {Colors} from '~/styles';
import {
  HomeScreenNavProp,
  NfcTagOperationStatus,
  NfcTagScanningReason,
} from '~/types';
import {
  getCurrentUtcTimestamp,
  getLocalTimestamp,
  showPrintBalanceAlert,
  showToast,
} from '~/utils';
import {printText} from './../core/ReceiptPrinter';

const testCardNumber = 'K-0035';
console.log('Test Card Number: ', testCardNumber);

export interface Props {
  navigation: HomeScreenNavProp;
}

const Home: FC<Props> = ({navigation: {navigate}}) => {
  const {loginData} = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [dailyReceiptPrintLoading, setDailyReceiptPrintLoading] =
    useState(false);
  const [printPreviousReceiptLoading, setPrintPreviousReceiptLoading] =
    useState(false);
  const [bottomModalShown, setBottomModalShown] = useState(false);
  const [scanningStatus, setScanningStatus] =
    useState<NfcTagOperationStatus>('scanning');
  const [nfcTagScanningReason, setNfcTagScanningReason] =
    useState<NfcTagScanningReason>('expense');
  const [error, setError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [loaderLoading, setLoaderLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initNfcManager();
        console.log('Nfc Manager Init');

        const _printDate = await getDailyReportPrintedDate();
        console.log('Daily report printDate: ', _printDate);

        if (_printDate === null) {
          await printDailyReport();
        } else {
          const printDate = moment(_printDate);
          const currentDate = moment();
          const time = moment('00:00:00', 'HH:mm:ss');

          if (
            currentDate.isAfter(printDate, 'day') &&
            currentDate.isSameOrAfter(time, 'second')
          ) {
            await printDailyReport();
          }
        }
      } catch (error) {
        console.log('Error Initializing Nfc Manager');
      }
    })();
  }, []);

  useEffect(() => {
    if (scanningStatus === 'success') {
      onReadNfcTagSuccess();
    }
  }, [scanningStatus]);

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

  const onReadNfcTagSuccess = useCallback(async () => {
    clearAllStates();
    setLoaderLoading(true);

    const issuanceHistoryRes = await doGetIssuanceHistory(cardNumber);
    console.log('Issucance History: ', issuanceHistoryRes?.data);

    if (nfcTagScanningReason !== 'balance') {
      if (issuanceHistoryRes?.data) {
        setLoaderLoading(false);

        navigate(routeNames.PrintExpense, {
          client: {
            id: issuanceHistoryRes.data?.Client_id,
            code: issuanceHistoryRes.data?.clientCode,
            name: issuanceHistoryRes.data?.clientName,
          },
          paybackPeriod: issuanceHistoryRes.data?.paybackPeriod,
          maxAmount: parseFloat(
            nfcTagScanningReason === 'expense'
              ? issuanceHistoryRes?.data?.Balance
              : issuanceHistoryRes?.data?.Amount,
          ),
          cardId: cardNumber,
          pinCode: issuanceHistoryRes.data.Pincode,
          issuanceHistoryId: issuanceHistoryRes?.data?.id,
          paymentType: nfcTagScanningReason,
        });
      } else {
        setLoaderLoading(false);
        showToast(issuanceHistoryRes?.message);
      }
    } else {
      setLoaderLoading(false);

      if (issuanceHistoryRes?.data) {
        const balance = parseFloat(issuanceHistoryRes?.data?.Balance);

        showPrintBalanceAlert(balance, cardNumber, async () => {
          try {
            await printBalance(
              {
                id: issuanceHistoryRes.data?.Client_id,
                code: issuanceHistoryRes.data?.clientCode,
                name: issuanceHistoryRes.data?.clientName,
              },
              cardNumber,
              loginData?.name,
              balance,
              issuanceHistoryRes?.data?.paybackPeriod ?? 0,
            );
          } catch (error) {
            console.log('Error printing Balance');

            showToast(error.message);
          }
        });
      } else {
        showToast(issuanceHistoryRes?.message);
      }
    }
  }, [cardNumber, nfcTagScanningReason]);

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
    setLoaderLoading(false);
  };

  const hideBottomModal = useCallback(() => {
    cleanUpReadingListners();
    setBottomModalShown(false);
  }, []);

  const onScanNfcPressed = useCallback(async () => {
    // setCardNumber(testCardNumber);
    // setScanningStatus('success');
    setNfcTagScanningReason('expense');
    showBottomModal();
  }, []);

  const onScanNfcForRetourPressed = useCallback(async () => {
    // setCardNumber(testCardNumber);
    // setScanningStatus('success');
    setNfcTagScanningReason('retour');
    showBottomModal();
  }, []);

  const onPrintPreviousPrintedReceipt = useCallback(async () => {
    setPrintPreviousReceiptLoading(true);

    try {
      const previousReceipt = await getPreviousPrintedReceipt();

      if (previousReceipt !== null) {
        await printText(previousReceipt);
      } else {
        showToast('There is no previous receipt');
      }
    } catch (error) {
      console.log('Error printing previous printed receipt');
      showToast(error.message);
    }

    setPrintPreviousReceiptLoading(false);
  }, []);

  const onScanNfcForBalance = useCallback(async () => {
    // setCardNumber(testCardNumber);
    // setScanningStatus('success');
    setNfcTagScanningReason('balance');
    showBottomModal();
  }, []);

  const printDailyReport = useCallback(async () => {
    setDailyReceiptPrintLoading(true);

    const apiResponse = await doGetDailyTransactions();

    if (apiResponse.data) {
      const currentTimestamp = getLocalTimestamp(getCurrentUtcTimestamp());

      if (apiResponse.data.length === 0) {
        showToast('There are no transactions to be printed');
        setDailyReceiptPrintLoading(false);
        setDailyReportPrintedDate(currentTimestamp.toString());
        return;
      }

      try {
        await printDailyReceipt(apiResponse.data, loginData?.name);
        setDailyReportPrintedDate(currentTimestamp.toString());
      } catch (error) {
        console.log('Error printing daily Receipt');
        showToast(error.message);
      }
    } else {
      showToast(apiResponse.message);
    }

    setDailyReceiptPrintLoading(false);
  }, []);

  const onPrintDailyReceiptPressed = useCallback(async () => {
    await printDailyReport();
  }, []);

  const onTryAgainPressed = useCallback(() => {
    readTag();
  }, []);

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

  const renderModalContent = useCallback(() => {
    if (scanningStatus === 'scanning') {
      return renderNfcScanning();
    } else {
      return renderTryAgain();
    }
  }, [scanningStatus]);

  const renderButtons = useCallback(() => {
    if (appModes === 'debug') {
      return (
        <>
          <Button
            title="Expense"
            style={styles.scanNfcBtn}
            loading={loading}
            onPress={onScanNfcPressed}
          />
          <Button
            title="Retour"
            style={styles.scanNfcBtn}
            onPress={onScanNfcForRetourPressed}
          />
        </>
      );
    } else if (appModes === 'expense') {
      return (
        <>
          <Button
            title="Expense"
            style={styles.scanNfcBtn}
            loading={loading}
            onPress={onScanNfcPressed}
          />
        </>
      );
    } else {
      return (
        <>
          <Button
            title="Retour"
            style={styles.scanNfcBtn}
            onPress={onScanNfcForRetourPressed}
          />
        </>
      );
    }
  }, []);

  return (
    <ScreenContainer>
      <Header title="Home" hasLogoutButton hasSettingsButton />
      <View style={styles.f1}>
        <View style={styles.contentContainer}>
          <Image source={logo} style={styles.logo} />
          {renderButtons()}
          <Button
            loading={printPreviousReceiptLoading}
            title="Print Previous Receipt"
            style={styles.scanNfcBtn}
            onPress={onPrintPreviousPrintedReceipt}
          />
          <Button
            title="Show Balance"
            style={styles.scanNfcBtn}
            onPress={onScanNfcForBalance}
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
      <Loader visible={loaderLoading} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  contentContainer: {
    alignSelf: 'center',
    marginTop: responsiveHeight(5),
    alignItems: 'center',
    width: '80%',
  },
  nfcIconWrapper: {
    borderWidth: responsiveWidth(0.3),
    borderColor: Colors.primary,
    borderRadius: responsiveWidth(50) / 20,
    padding: responsiveWidth(2),
  },
  logo: {
    height: responsiveWidth(40),
    width: responsiveWidth(40),
  },
  scanNfcBtn: {
    marginTop: responsiveHeight(4),
    width: '80%',
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
