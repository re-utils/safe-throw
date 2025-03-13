A lightweight, low overhead errors-as-values API.

# Examples
Return errors:
```ts
import * as st from 'safe-throw';

const divide = (a: number, b: number) =>
  b === 0 ? st.err('Cannot divide by 0') : a / b;

const res = divide(9, Math.random());
if (st.isErr(res)) {
  console.error(st.payload(res));
} else {
  console.log(res);
}
```

Wrapping fetch calls:
```ts
import * as st from 'safe-throw';
import * as native from 'safe-throw/native';

// Wrap fetch error in a native error instance
const safeFetch = native.asyncTry(fetch);

const res = await safeFetch('http://example.com');
if (st.isErr(res)) {
  // Get the error payload
  const err = st.payload(res);
  console.error(err);
} else {
  // Use response normally
  console.log(await res.text());
}
```

Handling promise errors:
```ts
import * as st from 'safe-throw';
import * as native from 'safe-throw/native';

const res = await native.tryPromise(
  fetch('http://localhost:3000')
);
if (st.isErr(res)) {
  // Get the error payload
  const err = st.payload(res);
  console.error(err);
} else {
  // Use response normally
  console.log(await res.text());
}
```

Unwrapping a value:
```ts
import * as st from 'safe-throw';

const divide = (a: number, b: number) =>
  b === 0 ? st.err('Cannot divide by 0') : a / b;

// Throws an Error when the value is an error
const res = st.unwrap(divide(9, Math.random() + 2));
```

Create tagged errors:
```ts
import * as st from 'safe-throw';

const httpErr = st.taggedErr('http');

const fn = () => {
  const n1 = Math.random(),
    n2 = Math.random();

  if (n1 < 0.5)
    return httpErr('random');

  if (n2 < 0.5)
    return st.err('the generated number is too small');

  return n1 + n2;
}

const res = fn();
if (st.isErr(res)) {
  if (st.taggedWith('http', res)) {
    // Handle http error
  } else {
    // Handle untagged errors
  }
} else {
  console.log(res);
}
```

Match different error tags:
```ts
import * as st from 'safe-throw';

const httpErr = st.taggedErr('http');
const validationErr = st.taggedErr('validation');

const fn = () => {
  const n1 = Math.random(),
    n2 = Math.random();

  if (n1 < 0.5)
    return httpErr('random');

  if (n2 < 0.5)
    return st.err('the generated number is too small');

  const sum = n1 + n2;
  return sum < 0.15
    ? validationErr('sum of two generated numbers is too small')
    : sum;
}

const res = fn();
if (st.isErr(res)) {
  if (st.tagged(res)) {
    // Match tags
    switch (st.tag(res)) {
      case 'http':
        // Handle http error
        break;

      case 'validation':
        // Handle validation error
        break;
    }
  } else {
    // Handle untagged errors
  }
} else {
  console.log(res);
}
```

Retrying functions:
```ts
import * as st from 'safe-throw';
import * as retry from 'safe-throw/retry';
import * as native from 'safe-throw/native';

{
  // Run fetch until no error occured or tried 5 times
  const fetchFiveTimes = retry.repeatAsync(5, native.req);

  const res = await fetchFiveTimes('http://example.com');
  if (st.isErr(res)) {
    // ...
  }
}

{
  // Retry until a condition is met
  const fetchUntilSucceed = retry.untilAsync(
    (res) => st.isErr(res) || res.status === 200,
    native.req
  );

  const res = await fetchUntilSucceed('http://example.com');
  if (st.isErr(res)) {
    // ...
  }
}

{
  // More complex use cases
  const runFetch = retry.runAsync(
    native.req,
    // Initialize states when retrying
    () => ({ retryCount: 0, startTime: performance.now() }),
    // Run until retried 5 times or the opteration takes more than 15 seconds
    (state, res) => state.retryCount++ > 5 || performance.now() - state.startTime > 15000),
  );

  const res = await runFetch('http://example.com');
  if (st.isErr(res)) {
    // ...
  }
}
```

Handling errors with generators.
```ts
import * as st from 'safe-throw';
import * as flow from 'safe-throw/flow';

const rand = () => Math.random() < 0.5 ? st.err('Number too small') : Math.random();

// This can be used as a virtual thread
// It's faster than the same behavior with async functions
const fn = function* () {
  const rand = yield* flow.unwrap(rand());
  return rand * 5;
}

const res = await flow.run(fn());
if (st.isErr(res)) {
  // ...
}
```
