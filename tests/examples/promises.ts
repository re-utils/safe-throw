import * as st from 'safe-throw';
import * as promises from 'safe-throw/promises';
import * as pipe from 'safe-throw/pipe';

const addServiceCharge = (amount: number) => amount + 1

const fetchTransactionAmount = () => Promise.resolve(100);
const fetchDiscountRate = async () => Math.random() < 0.3 ? st.err('Too low') : 12;

const run = pipe
  .init(() => promises.all([
    fetchTransactionAmount(),
    fetchDiscountRate()
  ]))
  .pipe(
    ([total, discountRate]: [number, number]) =>
      discountRate === 0
        ? st.err('Discount rate cannot be zero')
        : total - (total * discountRate) / 100
  )
  .pipe(addServiceCharge)
  .pipe((finalAmount) => `Final amount to charge: ${finalAmount}`)
  .fn;
