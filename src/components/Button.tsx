import React, {FC} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import {Colors} from '~/styles';

export interface Props extends TouchableOpacityProps {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  title: string;
  loading?: boolean;
}

const Button: FC<Props> = ({style, textStyle, title, loading, ...props}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} {...props}>
      {loading ? (
        <ActivityIndicator animating color={Colors.white} size="large" />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  container: {
    backgroundColor: Colors.primary,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: responsiveFontSize(1.5),
    borderRadius: responsiveWidth(50) / 2,
  },
  text: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: responsiveFontSize(2),
  },
});

export default Button;
