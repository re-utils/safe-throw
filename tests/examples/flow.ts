import * as st from 'safe-throw';
import * as flow from 'safe-throw/flow';

const rnd = () => Math.random() < 0.5 ? st.err('Number too small') : Math.random();

// This can be used as a virtual thread
// It's faster than the same behavior with async functions
const fn = function* () {
  const rand = yield* flow.unwrap(rnd());
  const rand2 = yield* flow.unwrap(rnd());

  return rand + rand2 * 5;
}

const res = await flow.run(fn());
console.log(res);
