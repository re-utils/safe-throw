import * as st from 'safe-throw';
import * as pipe from 'safe-throw/pipe';

const modifyNumber = pipe.sync((x: number) => x + 1)
  .pipe((x) => x * 2)
  .pipe((x) => x < 0.1 ? st.err('Number too small') : x)
  .fn;

console.log(modifyNumber(5));
