import { summary, run, bench, do_not_optimize } from 'mitata';
import { st } from 'safe-throw';

summary(() => {
  const data = new Array(1000).fill(0).map(() =>
    () => new Array(Math.ceil(Math.random() * 5 + 3)).fill(0).map(() => {
      const i = Math.random();
      return i < 0.5 ? Promise.resolve('str') : i < 0.7 ? 9 : Promise.reject(new Error())
    })
  );

  const setup = (label: string, fn: (arr: any[]) => any) => bench(label, function* () {
    let i = 0;
    yield {
      [0]: () => {
        i = (i + 1) % data.length;
        return data[i]();
      },
      bench: fn
    }
  });

  setup('native allSettled', async (d) => {
    do_not_optimize(await Promise.allSettled(d));
    // const results = await Promise.allSettled(d);
    // const errors = [];

    // for (let i = 0; i < results.length; i++) {
    //   const stat = results[i];
    //   if (stat.status === 'rejected')
    //     errors.push(stat.reason);
    // }

    // do_not_optimize(errors);
  });

  setup('safe-throw all', async (d) => {
    for (let i = 0; i < d.length; i++)
      if (d[i] instanceof Promise)
        d[i] = st.promiseTry(d[i]);

    do_not_optimize(await Promise.all(d));
    // const results = await Promise.all(d);
    // const errors = [];

    // for (let i = 0; i < results.length; i++) {
    //   const stat = results[i];
    //   if (st.isErr(stat))
    //     errors.push(st.payload(stat));
    // }

    // do_not_optimize(errors);
  });
});

run();
