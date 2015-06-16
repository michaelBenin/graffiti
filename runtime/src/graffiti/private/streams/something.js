function isObject(value) {
  // Avoid an old bug in Chrome 19-20
  // See https://code.google.com/p/v8/issues/detail?id=2291
  const type = typeof value;
  return type === 'function' || (!!value && type === 'object');
}

function ofPropertyChanges(obj, key) {
  if (isObject(obj) === false) {
    return Observable.return(undefined);
  }
  
  return Observable.ofObjectChanges(obj)
    .filter(change => change.name === key)
    .map(({ object, name }) => object[name])
    .startWith(obj[key]);
}

export default function ofPropertyPathChanges(obj, path) {
  const parts = path.split('.');
  const firstKey = parts.shift();
  
  return Observable.return(obj)
    .map(obj => ofPropertyChanges(obj, firstKey))
    .concat(Observable.from(parts))
    .reduce(
      (stream, key) => stream.flatMapLatest(
        obj => ofPropertyChanges(obj, key)
      )
    )
    .concatAll();
}