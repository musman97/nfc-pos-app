import {NativeModules} from 'react-native';
import {PosPrinterInterface, PrinterConfig} from '../types/index';

const PosPrinterModule = NativeModules.PosPrinterModule;
const module = PosPrinterModule as PosPrinterInterface;

export const defaultConfig: PrinterConfig = {
  printerDpi: 203,
  printerWidthMM: 48,
  printerNbrCharactersPerLine: 32,
};

export const print: (
  textToBePrinted: string,
  config?: PrinterConfig,
) => Promise<void> = async (textToBePrinted, config) => {
  await module.print(
    textToBePrinted,
    config.printerDpi,
    config.printerWidthMM,
    config.printerNbrCharactersPerLine,
  );
};
