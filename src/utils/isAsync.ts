// eslint-disable-next-line
const c = (async () => { }).constructor;
export default (f: any): f is (...args: any[]) => Promise<any> => f instanceof c;
