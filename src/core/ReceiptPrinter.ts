import moment from 'moment';
import {print} from '~/native_modules/PosPrinter';
import {Client} from '~/types';

export const printReceipt: (
  price: number,
  customer: Client,
) => Promise<void> = async (price, customer) => {
  const textToBePrinted =
    "[C]<u><font size='big'>Norsa N.V</font></u>\n" +
    '[L]\n' +
    `[C]Receipt N.O: ${(Math.random() * 1000).toFixed(0)}\n` +
    `[C]${moment().format('DD MMM, YYYY HH:mm:ss')}\n` +
    `[L]\n` +
    '[C]================================\n' +
    '[L]\n' +
    `[R]Expense Amount :[R]NAFL ${price}\n` +
    '[C]================================\n' +
    '[L]\n' +
    "[L]<font size='tall'>Merchant :</font>\n" +
    '[L]Jake Gill\n' +
    "[L]<font size='tall'>Customer :</font>\n" +
    `[L]${customer.FirstName} ${customer.LastName}\n` +
    `[L]${customer.Code}\n` +
    `[L]\n` +
    `[L]Thank you for your purchase\n` +
    `[L]For questions or inquiries call customer service : 767-1563`;

  console.log(textToBePrinted);

  await print(textToBePrinted);
};
