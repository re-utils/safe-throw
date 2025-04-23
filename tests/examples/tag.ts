import * as st from 'safe-throw';

const fooErr = st.taggedErr('foo');
const barErr = st.taggedErr('bar');

const fn = () => Math.random() < 0.5 ? fooErr('foo') : barErr('bar');

const res = fn();
if (st.isErr(res)) {
  switch (st.tag(res)) {
    case 'bar':
      console.log('Bar');
      break;

    case 'foo':
      console.log('Foo');
      break;
  }
}
