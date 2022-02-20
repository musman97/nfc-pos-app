import React, {FC} from 'react';
import {ActivityIndicator, Modal, StyleSheet, View} from 'react-native';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {Colors} from '~/styles';

export interface Props {
  visible: boolean;
}

const Loader: FC<Props> = ({visible}) => {
  return (
    <Modal style={styles.f1} transparent animationType="fade" visible={visible}>
      <View style={styles.container}>
        <View style={styles.f1}>
          <View style={styles.contentContainer}>
            <ActivityIndicator
              size={responsiveFontSize(5)}
              color={Colors.white}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.modalBackdrop,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Loader;
