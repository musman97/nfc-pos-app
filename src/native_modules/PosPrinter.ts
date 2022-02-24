import {NativeModules} from 'react-native';
import {PosPrinterInterface, PrinterConfig} from '../types/index';
import {getPrinterDefaultConfig} from './../core/LocalStorageService';

const PosPrinterModule = NativeModules.PosPrinterModule;
const module = PosPrinterModule as PosPrinterInterface;

export const print: (
  textToBePrinted: string,
) => Promise<void> = async textToBePrinted => {
  const config = await getPrinterDefaultConfig();

  console.log('Config', config);

  await module.print(
    textToBePrinted,
    config.printerDpi,
    config.printerWidthMM,
    config.printerNbrCharactersPerLine,
  );
};

export const printWithConfig: (
  textToBePrinted: string,
  config: PrinterConfig,
) => Promise<void> = async (text, config) => {
  console.log('Config', config);
  await module.print(
    text,
    config.printerDpi,
    config.printerWidthMM,
    config.printerNbrCharactersPerLine,
  );
};
