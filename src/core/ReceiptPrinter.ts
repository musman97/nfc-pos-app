import moment from 'moment';
import {print} from '~/native_modules/PosPrinter';
import {Customer, Item} from '~/types';

export const printReceipt: (
  items: Array<Item>,
  customer: Customer,
) => Promise<void> = async (items, customer) => {
  const itemsText = items
    .map(item => `[L]<b>${item.name}</b>[R]NAFL ${item.price}`)
    .join('\n');
  const totalPrice = items
    .map(it => it.price)
    .reduce((prev, curr) => prev + curr, 0);

  const textToBePrinted =
    "[C]<u><font size='big'>Norsa N.V</font></u>\n" +
    '[L]\n' +
    `[C]Receipt N.O: ${(Math.random() * 1000).toFixed(0)}\n` +
    `[C]${moment().format('DD MMM, YYYY')}\n` +
    `[L]\n` +
    '[C]================================\n' +
    '[L]\n' +
    `${itemsText}\n` +
    '[L]\n' +
    '[C]--------------------------------\n' +
    `[R]TOTAL PRICE :[R]NAFL ${totalPrice}\n` +
    '[C]================================\n' +
    '[L]\n' +
    "[L]<font size='tall'>Merchant :</font>\n" +
    '[L]Jake Gill\n' +
    "[L]<font size='tall'>Customer :</font>\n" +
    `[L]${customer.name}\n` +
    `[L]${customer.code}\n` +
    `[L]\n` +
    `[L]Thank you for your purchase\n` +
    `[L]For questions or inquiries call customer service : 767-1563`;

  console.log(textToBePrinted);

  await print(textToBePrinted);
};
