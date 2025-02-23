import * as st from 'safe-throw';

const modifyNumber = st.pipeline((x: number) => x + 1)
  .next((x) => x * 2)
  .next((x) => x < 0.1 ? st.err('Number too small') : x)
  .fn;

console.log(modifyNumber(5));
