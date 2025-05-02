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

// Wrap fetch error in a native error instance
const safeFetch = st.asyncTry(fetch);

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

const res = await st.promiseTry(
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
