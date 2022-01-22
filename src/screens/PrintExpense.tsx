import moment from 'moment';
import React, {FC, useCallback, useState} from 'react';
import {Keyboard, StyleSheet, Text, TextInput, View} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import {Button, Header} from '~/components';
import {doCreateTrasactionHistory} from '~/core/ApiService';
import {printReceipt} from '~/core/ReceiptPrinter';
import {Colors} from '~/styles';
import {AddItemsScreeProps} from '~/types';
import {showAlert, showToast} from '~/utils';

export interface Props extends AddItemsScreeProps {}

const PrintExpense: FC<Props> = ({route, navigation}) => {
  const [expensePrice, setExpensePrice] = useState('');
  const [hasPrintedForMerchant, setHasPrintedForMerchant] = useState(false);
  const [disableInput, setDisableInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const cardId = route.params?.cardId;
  const client = route.params?.client;
  const balance = route.params?.balance;

  const clearAllStates = useCallback(() => {
    setExpensePrice('');
    setHasPrintedForMerchant(false);
    setDisableInput(false);
    setLoading(false);
  }, []);

  const onExpensePriceTextChanged = useCallback<(text: string) => void>(
    text => {
      setExpensePrice(text);
    },
    [],
  );

  const onSaveAndPrintReceiptPressed = useCallback(async () => {
    Keyboard.dismiss();

    const _expensePrice = expensePrice.trim();

    if (_expensePrice === '') {
      showAlert('Empty Expense Amount', 'Expense Amount cannot be empty');
      return;
    }

    if (parseFloat(_expensePrice) === NaN) {
      showAlert('Invalid Amount', 'Expense Amount entered is invalid');
      return;
    }

    const price = parseFloat(_expensePrice);
    if (price > balance) {
      showAlert(
        'Expense Limit Reached',
        'The Expense amount exceeds your balance',
      );
      return;
    }

    try {
      if (hasPrintedForMerchant) {
        setLoading(true);

        await printReceipt(price, client);

        const tId = setTimeout(() => {
          clearTimeout(tId);
          clearAllStates();
          navigation.goBack();
        }, 1000);
      } else {
        setDisableInput(true);
        setLoading(true);

        const res = await doCreateTrasactionHistory({
          Client_id: client.id,
          ItemDescription: 'Expense',
          Merchant_ID: 'prefix-962',
          dateTime: moment().utc().toDate().toUTCString(),
          AmountUser: price,
        });

        if (res.success) {
          await printReceipt(price, client);
          setHasPrintedForMerchant(true);
          setLoading(false);
        } else {
          showToast(res.message);
          setDisableInput(false);
        }
      }
    } catch (error) {
      console.log('Error printing Receipt: ', error);
      showAlert('Error Printing', error?.message || 'Something went wrong');
    }
  }, [expensePrice, hasPrintedForMerchant]);

  return (
    <View style={styles.f1}>
      <Header title="Add Items" hasBackButton />
      <View style={[styles.f1, styles.container]}>
        <View>
          <View style={[styles.clientInfoWrapper, styles.clientInfoDivider]}>
            <View style={styles.clientInfoLeftColumn}>
              <Text style={styles.clientInfoLabelText}>Name</Text>
            </View>
            <View style={styles.clientInfoRightColumn}>
              <Text
                style={
                  styles.clientInfoValueText
                }>{`${client.FirstName} ${client.LastName}`}</Text>
            </View>
          </View>
          <View style={[styles.clientInfoWrapper, styles.clientInfoDivider]}>
            <View style={styles.clientInfoLeftColumn}>
              <Text style={styles.clientInfoLabelText}>Code</Text>
            </View>
            <View style={styles.clientInfoRightColumn}>
              <Text style={styles.clientInfoValueText}>{client.Code}</Text>
            </View>
          </View>
          <TextInput
            editable={!disableInput}
            style={styles.input}
            value={expensePrice}
            placeholder="Expense Amount"
            returnKeyType="done"
            keyboardType="numeric"
            onChangeText={onExpensePriceTextChanged}
          />
        </View>

        <Button
          title={
            !hasPrintedForMerchant
              ? 'Save and Print Receipt'
              : 'Print for Client'
          }
          style={styles.saveBtn}
          loading={loading}
          onPress={onSaveAndPrintReceiptPressed}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  container: {
    alignSelf: 'center',
    justifyContent: 'space-between',
    width: '95%',
    paddingBottom: responsiveHeight(3),
    alignItems: 'center',
  },
  listContainer: {
    width: '100%',
  },
  clientInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  clientInfoDivider: {
    borderBottomColor: Colors.border,
    borderBottomWidth: responsiveWidth(0.3),
    paddingVertical: responsiveHeight(1),
  },
  clientInfoLeftColumn: {
    width: '30%',
  },
  clientInfoRightColumn: {
    width: '70%',
  },
  clientInfoLabelText: {
    color: Colors.black,
    fontSize: responsiveFontSize(2.5),
    fontWeight: 'bold',
  },
  clientInfoValueText: {
    color: Colors.gray,
    fontSize: responsiveFontSize(2.5),
  },
  input: {
    borderWidth: responsiveWidth(0.3),
    borderColor: Colors.border,
    borderRadius: responsiveWidth(50) / 20,
    marginTop: responsiveHeight(2),
    padding: responsiveFontSize(1.5),
  },
  totalPriceWrapper: {
    paddingVertical: responsiveHeight(1),
  },
  addItemBtn: {
    alignSelf: 'center',
    width: '80%',
    marginTop: responsiveHeight(2),
  },
  saveBtn: {
    width: '80%',
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(2),
    elevation: 1,
    backgroundColor: Colors.white,
    borderRadius: responsiveWidth(50) / 40,
  },
  itemRow: {},
  itemLabelText: {
    color: Colors.black,
    fontWeight: 'bold',
    fontSize: responsiveFontSize(1.8),
  },
  itemValueText: {
    color: Colors.gray,
    fontSize: responsiveFontSize(1.8),
    flexWrap: 'wrap',
  },
  deleteItemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PrintExpense;
