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
