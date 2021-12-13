import {NativeModules} from 'react-native';
import {PosPrinterInterface} from '../types/index';

const PosPrinterModule = NativeModules.PosPrinterModule;
const module = PosPrinterModule as PosPrinterInterface;

export const print: (
  textToBePrinted: string,
) => Promise<void> = async textToBePrinted => {
  await module.print(textToBePrinted);
};
