import {NativeModules} from 'react-native';

const PosPrinterModule = NativeModules.PosPrinterModule;

interface PosPrinterInterface {
  print: (textToBePrinted: string) => Promise<boolean>;
}

const module = PosPrinterModule as PosPrinterInterface;

export const print: (
  textToBePrinted: string,
) => Promise<void> = async textToBePrinted => {
  const text =
    '[L]\n' +
    "[C]<u><font size='big'>ORDER N°045</font></u>\n" +
    '[L]\n' +
    '[C]================================\n' +
    '[L]\n' +
    `[L]<b>${textToBePrinted}</b>[R]9.99e\n` +
    '[L]  + Size : S\n' +
    '[L]\n' +
    '[L]<b>AWESOME HAT</b>[R]24.99e\n' +
    '[L]  + Size : 57/58\n' +
    '[L]\n' +
    '[C]--------------------------------\n' +
    '[R]TOTAL PRICE :[R]34.98e\n' +
    '[R]TAX :[R]4.23e\n' +
    '[L]\n' +
    '[C]================================\n' +
    '[L]\n' +
    "[L]<font size='tall'>Customer :</font>\n" +
    '[L]Raymond DUPONT\n' +
    '[L]5 rue des girafes\n' +
    '[L]31547 PERPETES\n' +
    '[L]Tel : +33801201456\n' +
    '[L]\n' +
    "[C]<barcode type='ean13' height='10'>831254784551</barcode>\n" +
    "[C]<qrcode size='20'>http://www.developpeur-web.dantsu.com/</qrcode>";

  await module.print(text);
};
