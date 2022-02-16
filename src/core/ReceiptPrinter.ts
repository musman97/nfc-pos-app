import moment from 'moment';
import {print} from '~/native_modules/PosPrinter';
import {Client, DailyTransaction} from '~/types';

export const printReceipt: (
  price: number,
  customer: Client,
) => Promise<void> = async (price, customer) => {
  const textToBePrinted =
    "[C]<u><font size='big'>Norsa N.V.</font></u>\n" +
    '[L]\n' +
    `[C]Receipt N.O: ${(Math.random() * 1000).toFixed(0)}\n` +
    `[C]${moment().format('DD/MM/YYYY hh:mm:ss A')}\n` +
    `[L]\n` +
    '[C]================================\n' +
    '[L]\n' +
    `[L]Amount :[R]NAFL ${price}\n` +
    '[L]\n' +
    '[C]================================\n' +
    '[L]\n' +
    "[L]<font size='tall'>Merchant :</font>\n" +
    '[L]Jake Gill\n' +
    "[L]<font size='tall'>Customer :</font>\n" +
    `[L]${customer.name}\n` +
    `[L]${customer.code}\n` +
    "[L]<font size='tall'>Signature :</font>\n" +
    `[L]\n` +
    `[L]\n` +
    `[L]\n` +
    `[L]\n` +
    `[L]Thank you for your purchase\n` +
    `[L]For questions or inquiries call customer service : +5999 767-1563`;

  console.log(textToBePrinted);

  await print(textToBePrinted);
};

export const printDailyReceipt: (
  dailyTransactions: Array<DailyTransaction>,
) => Promise<void> = async dailyTransactions => {
  const listOfExpenses = dailyTransactions.reduce((prev, curr) => {
    return prev + `[L]${curr.Client_id}: [R]NAFL ${curr.AmountUser}\n`;
  }, '');
  const totalExpense = dailyTransactions
    .map(elm => elm.AmountUser)
    .reduce((prev, curr) => prev + curr, 0);

  const textToBePrinted =
    "[C]<u><font size='big'>Norsa N.V.</font></u>\n" +
    '[L]\n' +
    `[C]Receipt N.O: ${(Math.random() * 1000).toFixed(0)}\n` +
    `[C]${moment().format('DD/MM/YYYY hh:mm:ss A')}\n` +
    `[L]\n` +
    '[C]================================\n' +
    '[L]\n' +
    listOfExpenses +
    '[L]\n' +
    '[C]================================\n' +
    '[L]\n' +
    `[R]<b>Total :</b>NAFL [R]${totalExpense}\n` +
    "[L]<font size='tall'>Merchant :</font>\n" +
    '[L]Jake Gill\n' +
    "[L]<font size='tall'>Signature :</font>\n" +
    `[L]\n` +
    `[L]\n` +
    `[L]\n` +
    `[L]\n` +
    `[L]Thank you for your purchase\n` +
    `[L]For questions or inquiries call customer service : +5999 767-1563`;

  console.log(textToBePrinted);

  await print(textToBePrinted);
};
