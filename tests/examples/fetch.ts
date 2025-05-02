import { st } from 'safe-throw';

// Wrap error safely
const res = await st.request('http://example.com');

if (st.isErr(res)) {
  console.error(st.payload(res));
} else {
  console.log(await res.text());
}
