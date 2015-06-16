import BehaviorSubject from '../../streams/BehaviorSubject';
import Observable from '../../streams/Observable';

export default function getKey(obj, key) {
  const self = (obj instanceof BehaviorSubject) ? obj : obj.self || obj.locals.view;
  const subject = new BehaviorSubject();

  if (key === 'items') {
    //debugger;
  }

  self
    .map(obj => ofPropertyChanges(obj, key))
    .concatAll()
    .subscribe(subject);

  return subject;
}

window.ofPropertyChanges = ofPropertyChanges;

function ofPropertyChanges(obj, key) {
  if (isObject(obj) === false) {
    return Observable.return(undefined);
  }

  let stream;

  if (key === '[]') {
    stream = Observable.ofArrayChanges(obj)
      .map(({ object }) => object)
      .startWith(obj)
  } else {
    stream = Observable.ofObjectChanges(obj)
      .filter(change => change.name === key)
      .map(({ object, name }) => object[name])
      .startWith(obj[key])
  }
  
  return stream;
}

function isObject(value) {
  // Avoid an old bug in Chrome 19-20
  // See https://code.google.com/p/v8/issues/detail?id=2291
  const type = typeof value;
  return type === 'function' || (!!value && type === 'object');
}