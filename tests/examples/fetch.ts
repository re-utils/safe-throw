import * as native from 'safe-throw/native';
import * as st from 'safe-throw';

// Wrap error safely
const safeFetch = native.asyncTry(fetch);
const res = await safeFetch('http://example.com');

if (st.isErr(res)) {
  console.error(st.payload(res));
} else {
  console.log(await res.text());
}
