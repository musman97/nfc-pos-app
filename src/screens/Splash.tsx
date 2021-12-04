import React, {FC, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {Icons} from '~/components';
import {Colors} from '~/styles';
import {EmptyProps} from '~/types';
import {useAuthContext} from '~/context/AuthContext';

const Splash: FC<EmptyProps> = () => {
  const {setIsLoading} = useAuthContext();

  useEffect(() => {
    const tId = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  return (
    <View style={[styles.f1, styles.container]}>
      <Icons.MaterialCommunityIcons name="nfc" size={responsiveFontSize(15)} />
      <Text style={styles.splashText}>Norsa</Text>
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
  splashText: {
    fontSize: responsiveFontSize(5),
    color: Colors.red,
  },
});

export default Splash;
