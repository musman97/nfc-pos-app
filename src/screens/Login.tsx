import React, {FC} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

export interface Props {}

const Login: FC<Props> = ({}) => {
  return (
    <View style={[styles.f1, styles.container]}>
      <Text>Login</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Login;
