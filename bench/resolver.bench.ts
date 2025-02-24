import { summary, run, bench, type k_state, do_not_optimize } from 'mitata';
import { err, isErr } from 'safe-throw';

summary(() => {
  const LEN = 2 ** 16;
  const data = new Array(LEN)
    .fill(0)
    .map((_, i) => i % 8 === 0 ? err(null) : i);

  bench('Promise', function* () {
    yield {
      [0]() {
        return data;
      },
      async bench(d: any[]) {
        for (let i = 0; i < d.length; i++) {
          let r;
          const p = new Promise((res) => r = res);
          r!(isErr(d[i]) ? d[i] : null);
          do_not_optimize(await p);
        }
      }
    }
  });

  bench('Promise.withResolvers', function* () {
    yield {
      [0]() {
        return data;
      },
      async bench(d: any[]) {
        for (let i = 0; i < d.length; i++) {
          const p = Promise.withResolvers();
          p.resolve(isErr(d[i]) ? d[i] : null);
          do_not_optimize(await p.promise);
        }
      }
    }
  });
});

run();
