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
import {useAuthContext} from '~/context/AuthContext';
import {routeNames} from '~/navigation/routeNames';
import {HomeScreenNavProp, MainStackParamList} from '~/types';

export interface Props {
  style?: StyleProp<ViewStyle>;
  hasBackButton?: boolean;
  hasLogoutButton?: boolean;
  hasSettingsButton?: boolean;
  title: string;
}

const Header: FC<Props> = ({
  style,
  hasBackButton,
  title,
  hasLogoutButton,
  hasSettingsButton,
}) => {
  const {logout} = useAuthContext();

  const navigation = useNavigation<HomeScreenNavProp>();

  const onBackPressed = useCallback(() => {
    navigation.goBack();
  }, []);

  const onSettingsIconPressed = useCallback(() => {
    navigation.navigate(routeNames.PrinterConfig);
  }, []);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleContainer}>
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
      <View style={styles.fRow}>
        {hasSettingsButton ? (
          <TouchableOpacity onPress={onSettingsIconPressed}>
            <Icons.FontAwsome
              name="gear"
              size={responsiveFontSize(4)}
              color={Colors.white}
            />
          </TouchableOpacity>
        ) : null}
        {hasLogoutButton ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Icons.MaterialIcons
              name="logout"
              size={responsiveFontSize(4)}
              color={Colors.white}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  fRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    width: '100%',
    minHeight: responsiveHeight(8),
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(4),
  },
  titleContainer: {
    flexDirection: 'row',
  },
  backBtn: {
    marginRight: responsiveWidth(5),
  },
  titleText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: responsiveFontSize(3),
  },
  logoutBtn: {
    marginLeft: responsiveWidth(4),
  },
});

export default Header;
