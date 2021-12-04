import React, {FC} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  StatusBar,
} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import {Colors} from '~/styles';

export interface Props {
  style?: StyleProp<ViewStyle>;
}

const ScreenContainer: FC<Props> = ({children, style}) => {
  return (
    <View style={[styles.f1, styles.container, style]}>
      <StatusBar backgroundColor={Colors.accent} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  container: {
    backgroundColor: Colors.white,
  },
});

export default ScreenContainer;
