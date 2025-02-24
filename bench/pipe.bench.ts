import { summary, run, bench, type k_state } from 'mitata';

import * as st from 'safe-throw';
import * as pipe from 'safe-throw/pipe';


const increment = (x: number) => x + 1
const double = (x: number) => x < 100 ? st.err('Number too small') : x * 2
const subtractTen = (x: number) => x - 10;

summary(() => {
  bench('iterate pipe', function* (state: k_state) {
    const input = state.get('input');

    const fns = [increment, double, subtractTen];
    const f = (input: number) => {
      for (let i = 0; i < fns.length; i++) {
        input = fns[i](input) as any;
        if (st.isErr(input)) return input;
      }
      return input;
    }

    yield () => f(input);
  }).range('input', 1, 1024, 2);

  bench('safe-throw pipe', function* (state: k_state) {
    const input = state.get('input');

    const f = pipe
      .init(increment)
      .pipe(double)
      .pipe(subtractTen)
      .fn;

    yield () => f(input);
  }).range('input', 1, 1024, 4);

  bench('safe-throw pipe.sync', function* (state: k_state) {
    const input = state.get('input');

    const f = pipe
      .init(increment)
      .pipe(double)
      .pipe(subtractTen)
      .fn;

    yield () => f(input);
  }).range('input', 1, 1024, 4);
});

run();
