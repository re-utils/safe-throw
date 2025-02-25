A lightweight, low overhead errors-as-values API.

# Example usage
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

Unwrapping a value:
```ts
import * as st from 'safe-throw';

const divide = (a: number, b: number) =>
  b === 0 ? st.err('Cannot divide by 0') : a / b;

// Throws an UnexpectedError when the value is an error
const res = st.unwrap(divide(9, Math.random() + 2));
```

Create tagged errors:
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
    return validationErr('random');

  return n1 + n2;
}

const res = fn();
if (st.isErr(res)) {
  switch (st.tag(res)) {
    case 'http':
      // Handle http error
      break;

    case 'validation':
      // Handle validation error
      break;
  }
} else {
  console.log(res);
}
```
