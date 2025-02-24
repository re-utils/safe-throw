import * as st from 'safe-throw';
import * as pipe from 'safe-throw/pipe';

const addServiceCharge = (amount: number) => amount + 1;

const fetchTransactionAmount = async () => 100;
const fetchDiscountRate = async () => 10 * Math.random();

// Build a pipe
const run = pipe
  .init(() => Promise.all([
    fetchTransactionAmount(),
    fetchDiscountRate()
  ]))
  .pipe(
    ([total, discountRate]) => discountRate < 2
      ? st.err('Discount rate cannot be that small')
      : total - (total * discountRate) / 100
  )
  .pipe(addServiceCharge)
  .pipe((finalAmount) => `Final amount to charge: ${finalAmount}`)
  .fn;

run();
