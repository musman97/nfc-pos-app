import moment from 'moment';
import React, {FC, useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import {Button, Header, Icons, Loader, ScreenContainer} from '~/components';
import BottomModal from '~/components/BottomModal';
import {useAuthContext} from '~/context/AuthContext';
import {doGetDailyTransactions, doGetIssuanceHistory} from '~/core/ApiService';
import {
  getDailyReportPrintedDate,
  getPreviousPrintedReceipt,
  setDailyReportPrintedDate as setStorageDailyReportPrintedDate,
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
import {printText} from './../core/ReceiptPrinter';
import {
  getCurrentUtcTimestamp,
  getLocalTimestamp,
  showPrintBalanceAlert,
  showPrintDailyReportAlert,
  showToast,
} from '~/utils';

const testCardNumber = '0002';
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
  const [dailyReportPrintedDate, setDailyReportPrintedDate] = useState('');
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
        const date = await getDailyReportPrintedDate();

        if (date) {
          console.log('Daily Report Printed date: ', date);
          setDailyReportPrintedDate(date);
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

  const checkIfNeedToPrintDailyReport = useCallback(() => {
    if (dailyReportPrintedDate === '') {
      return true;
    } else {
      return moment().isAfter(getLocalTimestamp(dailyReportPrintedDate), 'day');
    }
  }, [dailyReportPrintedDate]);

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

        showPrintBalanceAlert(balance, async () => {
          try {
            await printBalance(
              {
                id: issuanceHistoryRes.data?.Client_id,
                code: issuanceHistoryRes.data?.clientCode,
                name: issuanceHistoryRes.data?.clientName,
              },
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

  const onScanNfcPressed = useCallback(() => {
    setNfcTagScanningReason('expense');

    if (checkIfNeedToPrintDailyReport()) {
      showPrintDailyReportAlert();
    } else {
      setCardNumber(testCardNumber);
      setScanningStatus('success');
      // showBottomModal();
    }
  }, [dailyReportPrintedDate]);

  const onScanNfcForRetourPressed = useCallback(() => {
    setNfcTagScanningReason('retour');

    if (checkIfNeedToPrintDailyReport()) {
      showPrintDailyReportAlert();
    } else {
      setCardNumber(testCardNumber);
      setScanningStatus('success');
      // showBottomModal();
    }
  }, [dailyReportPrintedDate]);

  const onPrintPreviousPrintedReceipt = useCallback(async () => {
    setPrintPreviousReceiptLoading(true);

    if (checkIfNeedToPrintDailyReport()) {
      showPrintDailyReportAlert();
    } else {
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
    }

    setPrintPreviousReceiptLoading(false);
  }, [dailyReportPrintedDate]);

  const onScanNfcForBalance = useCallback(() => {
    setNfcTagScanningReason('balance');

    if (checkIfNeedToPrintDailyReport()) {
      showPrintDailyReportAlert();
    } else {
      setCardNumber(testCardNumber);
      setScanningStatus('success');
      // showBottomModal();
    }
  }, [dailyReportPrintedDate]);

  const onPrintDailyReceiptPressed = useCallback(async () => {
    setDailyReceiptPrintLoading(true);

    const apiResponse = await doGetDailyTransactions();

    if (apiResponse.data) {
      if (apiResponse.data.length === 0) {
        const currentUtcTimeStamp = getCurrentUtcTimestamp();
        await setStorageDailyReportPrintedDate(currentUtcTimeStamp);
        setDailyReportPrintedDate(currentUtcTimeStamp);

        showToast('There are no transactions to be printed');
        setDailyReceiptPrintLoading(false);
        return;
      }

      try {
        await printDailyReceipt(apiResponse.data, loginData?.name);

        const currentUtcTimeStamp = getCurrentUtcTimestamp();
        await setStorageDailyReportPrintedDate(currentUtcTimeStamp);
        setDailyReportPrintedDate(currentUtcTimeStamp);
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

  return (
    <ScreenContainer>
      <Header title="Home" hasLogoutButton hasSettingsButton />
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
          <Button
            loading={dailyReceiptPrintLoading}
            title="Print Daily Receipt"
            style={styles.scanNfcBtn}
            onPress={onPrintDailyReceiptPressed}
          />
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
