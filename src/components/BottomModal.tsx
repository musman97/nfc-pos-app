import React, {FC} from 'react';
import {
  Modal,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {Colors} from '~/styles';

export interface Props {
  style?: StyleProp<ViewStyle>;
  visible: boolean;
  onBackDropPressed?: () => void;
}

const BottomModal: FC<Props> = ({
  children,
  style,
  visible,
  onBackDropPressed,
}) => {
  return (
    <Modal
      style={styles.f1}
      transparent
      animationType="slide"
      visible={visible}>
      <View style={styles.container}>
        <View style={styles.f1}>
          <TouchableOpacity
            style={styles.touchableArea}
            onPress={onBackDropPressed}
          />
        </View>
        <View style={[styles.contentContainer, style]}>{children}</View>
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
    backgroundColor: Colors.white,
  },
  touchableArea: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default BottomModal;
