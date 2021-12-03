import React, {FC, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import NfcManager, {NfcEvents, Ndef, NfcTech} from 'react-native-nfc-manager';
import {
  responsiveFontSize,
  responsiveHeight,
} from 'react-native-responsive-dimensions';
import {print} from '../native_modules/PosPrinter';

const showToast: (message: string) => void = message => {
  ToastAndroid.show(message, ToastAndroid.SHORT);
};

export interface Props {}

const readNdefTag: () => Promise<any | null> = () => {
  const cleanUp = () => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    NfcManager.setEventListener(NfcEvents.SessionClosed, null);
  };

  return new Promise(resolve => {
    let tagFound = null;

    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      tagFound = tag;
      resolve(tagFound);
      NfcManager.unregisterTagEvent().catch(() => 0);
    });

    NfcManager.setEventListener(NfcEvents.SessionClosed, () => {
      cleanUp();
      if (!tagFound) {
        resolve(null);
      }
    });

    NfcManager.registerTagEvent();
  });
};

const parseText: (tag: any) => string = tag => {
  try {
    if (Ndef.isType(tag.ndefMessage[0], Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
      return Ndef.text.decodePayload(tag.ndefMessage[0].payload);
    }
  } catch (error) {
    console.log('Error Parsing Nfc tag', error);
    return '';
  }
};

const Home: FC<Props> = ({}) => {
  const [reading, setReading] = useState(false);
  const [writing, setWriting] = useState(false);

  const [parsedText, setParsedText] = useState('');

  useEffect(() => {
    (async () => {
      try {
        await NfcManager.start();
        showToast('Nfc Manager Initialized');
      } catch (error) {
        console.warn('Error initializing NfcManager', error);
      }
    })();
  }, []);

  const onReadNfcTagPressed = async () => {
    try {
      if (writing) {
        showToast('Already serching for Nfc Tag to write');
        return;
      }
      if (reading) {
        showToast('Already serching for Nfc Tag to read');
        return;
      } else {
        setReading(true);
      }

      const tag = await readNdefTag();
      const text = parseText(tag);

      showToast('Text from Nfc Tag: ' + text);
      setParsedText(text);

      console.log('Read tag: ', tag);
    } catch (error) {
      console.log('Error Reading Nfc Tag', error);
      Alert.alert('Error', 'Error reading Nfc Tag ' + error.message);
    } finally {
      setReading(false);
    }
  };

  const onWriteNfcTagPressed = async () => {
    try {
      if (reading) {
        showToast('Already serching for Nfc Tag to read');
        return;
      }
      if (writing) {
        showToast('Already serching for Nfc Tag to write');
        return;
      } else {
        setWriting(true);
      }
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Ready to write some NDEF',
      });

      const bytes = Ndef.encodeMessage([Ndef.textRecord('Hello Nfc')]);

      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        showToast('Writing to Nfc Tag was Successfull');
      }
    } catch (ex) {
      console.log('Error writing Nfc Tag', ex);
      Alert.alert('Error', 'Error Writing to Nfc Tag ' + ex.message);
    } finally {
      setWriting(false);
    }

    NfcManager.cancelTechnologyRequest().catch(() => 0);
  };

  const onPrintPressed: () => Promise<void> = async () => {
    if (parsedText === '') {
      showToast('Parsed Text is Empty. Please try again');
    } else {
      try {
        await print(parsedText);
      } catch (error) {
        Alert.alert('Error', 'Error Printing parsed text' + error.message);
      }
    }
  };

  return (
    <View style={[styles.f1, styles.container]}>
      <View style={styles.contentContainer}>
        <TouchableOpacity style={styles.btn} onPress={onReadNfcTagPressed}>
          <Text style={styles.btnText}>Read Nfc Tag</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={onWriteNfcTagPressed}>
          <Text style={styles.btnText}>Write Nfc Tag</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={onPrintPressed}>
          <Text style={styles.btnText}>Print Parsed Text</Text>
        </TouchableOpacity>
        <Text style={styles.parsedTextMessage}>
          Parsed Text: <Text style={styles.parsedText}>{parsedText}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingTop: responsiveHeight(10),
  },
  contentContainer: {
    width: '80%',
  },
  btn: {
    backgroundColor: '#0ba6ff',
    marginBottom: responsiveHeight(5),
    padding: responsiveFontSize(2),
    borderRadius: responsiveFontSize(2) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: responsiveFontSize(2),
  },
  parsedTextMessage: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
  },
  parsedText: {
    color: 'red',
  },
});

export default Home;
