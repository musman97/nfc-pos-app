import NfcManager, {Ndef, NfcEvents, NfcTech} from 'react-native-nfc-manager';
import {NfcTagReadResult, NfcTagWriteResult, ParseTagResult} from '~/types';

const initNfcManager: () => Promise<void> = () => NfcManager.start();

const cleanUpReadingListners = () => {
  console.log('Cleaning Nfc Reading Listeners');
  NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
  NfcManager.setEventListener(NfcEvents.SessionClosed, null);
};

const cleanUpWriteRequest = () => {
  console.log('Cleaning Nfc Write Request');
  NfcManager.cancelTechnologyRequest().catch(() => 0);
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
          text: parseTagResult.text,
        });
      } else {
        resolve({
          success: false,
          error: parseTagResult.error,
          text: '',
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
          text: '',
        });
      }
    });

    NfcManager.registerTagEvent();
  });

const writeNfcTag: (
  valueToBeWritten: string,
) => Promise<NfcTagWriteResult> = value =>
  new Promise(async resolve => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Ready to write some Nfc tag',
      });

      const bytes = Ndef.encodeMessage([Ndef.textRecord(value)]);

      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        resolve({
          success: true,
          error: '',
        });
      } else {
        resolve({
          success: false,
          error: 'Unable to write data on Nfc Tag. Please try again',
        });
      }
    } catch (error) {
      resolve({
        success: false,
        error:
          error?.message ??
          'Something went wrong writing Nfc Tag. Please try again',
      });
    } finally {
      cleanUpWriteRequest();
    }
  });

export {
  initNfcManager,
  readNfcTag,
  writeNfcTag,
  cleanUpReadingListners,
  cleanUpWriteRequest,
  checkIfNfcEnabled,
};
