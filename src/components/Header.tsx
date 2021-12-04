import React, {FC, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import {Colors} from '~/styles';
import {Icons} from './index';

export interface Props {
  style?: StyleProp<ViewStyle>;
  hasBackButton?: boolean;
  title: string;
}

const Header: FC<Props> = ({style, hasBackButton, title}) => {
  const navigation = useNavigation();

  const onBackPressed = useCallback(() => {
    navigation.goBack();
  }, []);

  return (
    <View style={[styles.container, style]}>
      {hasBackButton ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBackPressed}>
          <Icons.MaterialIcons
            name="arrow-back"
            color={Colors.white}
            size={responsiveFontSize(4)}
          />
        </TouchableOpacity>
      ) : null}
      <Text style={styles.titleText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    width: '100%',
    minHeight: responsiveHeight(8),
    elevation: 10,
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
  },
  backBtn: {
    marginRight: responsiveWidth(5),
  },
  titleText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: responsiveFontSize(3),
  },
});

export default Header;
