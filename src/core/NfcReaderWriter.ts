import NfcManager, {Ndef, NfcEvents} from 'react-native-nfc-manager';
import {NfcTagReadResult, ParseTagResult} from '~/types';

let isReading = false;

const initNfcManager: () => Promise<void> = () => NfcManager.start();

const cleanUpReadingListners = () => {
  console.log('Cleaning Nfc Reading Listeners');
  NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
  NfcManager.setEventListener(NfcEvents.SessionClosed, null);
};

const parseText: (tag: any) => ParseTagResult = tag => {
  try {
    if (Ndef.isType(tag.ndefMessage[0], Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
      const text = Ndef.text.decodePayload(tag.ndefMessage[0].payload);

      if (text.trim() === '') {
        return {
          success: false,
          error: 'Invalid Nfc Tag. Please try again with another tag',
          text: '',
        };
      }
      return {
        success: true,
        error: '',
        text,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error?.message ?? 'Something went wrong on reading Nfc Tag',
      text: '',
    };
  }
};

const checkIfNfcEnabled: () => Promise<boolean> = () => NfcManager.isEnabled();

const readNfcTag: () => Promise<NfcTagReadResult> = () =>
  new Promise<NfcTagReadResult>(resolve => {
    let tagFound = null;

    NfcManager.setEventListener(NfcEvents.DiscoverTag, async tag => {
      tagFound = tag;

      const parseTagResult = parseText(tagFound);

      if (parseTagResult.success) {
        console.log('Resolving Success', parseTagResult);
        resolve({
          success: true,
          error: '',
          userId: parseTagResult.text,
        });
      } else {
        resolve({
          success: false,
          error: parseTagResult.error,
          userId: '',
        });
      }
      NfcManager.unregisterTagEvent().catch(() => 0);
    });

    NfcManager.setEventListener(NfcEvents.SessionClosed, () => {
      cleanUpReadingListners();
      if (!tagFound) {
        resolve({
          success: false,
          error: 'Unable to find any Nfc Tag nearby. Please try again',
          userId: '',
        });
      }
    });

    NfcManager.registerTagEvent();
  });

export {initNfcManager, readNfcTag, cleanUpReadingListners, checkIfNfcEnabled};
