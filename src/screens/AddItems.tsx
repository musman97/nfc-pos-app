import React, {FC, useState, useRef, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ListRenderItem,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import {KeyboardAwareFlatList as FlatList} from 'react-native-keyboard-aware-scroll-view';
import {Button, Header, Icons} from '~/components';
import {AddItemsScreeProps, Item} from '~/types';
import {flatListKeyExtractor, isValidNumber, showAlert} from '~/utils';
import {Colors} from '~/styles';
import {printReceipt} from '~/core/ReceiptPrinter';

export interface Props extends AddItemsScreeProps {}

const AddItems: FC<Props> = ({route}) => {
  const [items, setItems] = useState<Array<Item>>([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [balance, setBalance] = useState(1000);
  const [totalPrice, setTotalPrice] = useState(0);

  const code = route.params?.code ?? '12345678';

  useMemo(() => {
    if (items.length) {
      const totalPrice = items
        .map(item => item.price)
        .reduce((prev, curr) => prev + curr, 0);

      setTotalPrice(totalPrice);
    } else {
      setTotalPrice(0);
    }
  }, [items]);

  const itemPriceInputRef = useRef<TextInput>();

  const clearAllStates = useCallback(() => {
    setItems([]);
    setItemName('');
    setItemPrice('');
    setBalance(1000);
  }, []);

  const onItemNameEndEditingPressed = useCallback(() => {
    itemPriceInputRef.current.focus();
  }, []);

  const onItemNameTextChanged = useCallback<(text: string) => void>(text => {
    setItemName(text);
  }, []);

  const onItemPriceTextChanged = useCallback<(text: string) => void>(text => {
    setItemPrice(text);
  }, []);

  const onAddItemPressed = useCallback(() => {
    const _itemName = itemName.trim();
    const _itemPrice = parseFloat(itemPrice.trim());

    if (_itemName === '') {
      showAlert('Empty Item Name', 'Item name cannot be empty');
      return;
    }

    if (isNaN(_itemPrice) || _itemPrice < 1) {
      showAlert('Invalid Item Price', 'Please enter a valid item price');
      return;
    }

    if (totalPrice + _itemPrice > balance) {
      showAlert(
        'Balance Exceeded',
        'You cannot add this Item beacuse it exceeds the available balance',
      );
      return;
    }

    const newItems = [...items];
    newItems.push({
      name: _itemName,
      price: _itemPrice,
    });

    setItemName('');
    setItemPrice('');
    setItems(newItems);
  }, [items, itemName, itemPrice]);

  const onDeleteItemPressed = useCallback(
    (index: number) => () => {
      const newItems = items.filter((_, idx) => idx !== index);
      setItems(newItems);
    },
    [items],
  );

  const onSaveAndPrintReceiptPressed = useCallback(async () => {
    if (totalPrice === 0) {
      showAlert('No Items', 'There are no items added to be printed');
      return;
    }

    try {
      await printReceipt(items, {
        name: 'John Doe',
        code: code,
      });
      clearAllStates();
    } catch (error) {
      console.log('Error printing Receipt: ', error);
      showAlert('Error Printing', error?.message || 'Something went wrong');
    }
  }, [items, totalPrice]);

  const renderListItem: ListRenderItem<Item> = ({
    item: {name, price},
    index,
  }) => {
    return (
      <View style={styles.itemWrapper}>
        <View style={styles.f1}>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabelText}>Name: </Text>
            <Text style={styles.itemValueText}>{name}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabelText}>Price(NAFL): </Text>
            <Text style={styles.itemValueText}>{price}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteItemWrapper}
          onPress={onDeleteItemPressed(index)}>
          <Icons.MaterialIcons
            name="close"
            size={responsiveFontSize(3)}
            color={Colors.red}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.f1}>
      <Header title="Add Items" hasBackButton />
      <View style={[styles.f1, styles.container]}>
        <View style={[styles.f1, styles.listContainer]}>
          <FlatList
            ListHeaderComponent={
              <>
                <View
                  style={[styles.clientInfoWrapper, styles.clientInfoDivider]}>
                  <View style={styles.clientInfoLeftColumn}>
                    <Text style={styles.clientInfoLabelText}>Name</Text>
                  </View>
                  <View style={styles.clientInfoRightColumn}>
                    <Text style={styles.clientInfoValueText}>John Doe</Text>
                  </View>
                </View>
                <View
                  style={[styles.clientInfoWrapper, styles.clientInfoDivider]}>
                  <View style={styles.clientInfoLeftColumn}>
                    <Text style={styles.clientInfoLabelText}>Code</Text>
                  </View>
                  <View style={styles.clientInfoRightColumn}>
                    <Text style={styles.clientInfoValueText}>{code}</Text>
                  </View>
                </View>
                <View
                  style={[styles.clientInfoWrapper, styles.clientInfoDivider]}>
                  <View style={styles.clientInfoLeftColumn}>
                    <Text style={styles.clientInfoLabelText}>Balance</Text>
                  </View>
                  <View style={styles.clientInfoRightColumn}>
                    <Text style={styles.clientInfoValueText}>
                      NAFL {balance}
                    </Text>
                  </View>
                </View>
                <TextInput
                  style={styles.input}
                  value={itemName}
                  placeholder="Item name"
                  returnKeyType="next"
                  onEndEditing={onItemNameEndEditingPressed}
                  onChangeText={onItemNameTextChanged}
                />
                <TextInput
                  ref={itemPriceInputRef}
                  style={styles.input}
                  value={itemPrice}
                  placeholder="Item price"
                  returnKeyType="done"
                  returnKeyLabel="Add Item"
                  keyboardType="numeric"
                  onChangeText={onItemPriceTextChanged}
                />
                <Button
                  title="Add Item"
                  style={styles.addItemBtn}
                  onPress={onAddItemPressed}
                />
              </>
            }
            keyExtractor={flatListKeyExtractor}
            data={items}
            renderItem={renderListItem}
          />
        </View>
        <View style={[styles.clientInfoWrapper, styles.totalPriceWrapper]}>
          <View style={styles.clientInfoLeftColumn}>
            <Text style={styles.clientInfoLabelText}>Total</Text>
          </View>
          <View style={styles.clientInfoRightColumn}>
            <Text style={styles.clientInfoValueText}>NAFL {totalPrice}</Text>
          </View>
        </View>
        <Button
          title="Save and Print Receipt"
          style={styles.saveBtn}
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

export default AddItems;
