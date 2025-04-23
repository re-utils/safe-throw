import * as native from 'safe-throw/native';
import * as st from 'safe-throw';

// Wrap error safely
const res = await native.request('http://example.com');

if (st.isErr(res)) {
  console.error(st.payload(res));
} else {
  console.log(await res.text());
}
