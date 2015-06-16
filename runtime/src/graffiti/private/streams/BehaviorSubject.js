export default Rx.BehaviorSubject;

import Observable from './Observable';

const checkDisposed = Rx.Disposable.checkDisposed;

function cloneArray(arr) {
  var len = arr.length, a = new Array(len);
  for (var i = 0; i < len; i++) { a[i] = arr[i]; }
  return a;
}

class InnerSubscription {
  constructor(subject, observer) {
    this.subject = subject;
    this.observer = observer;
  }

  dispose() {
    if (!this.subject.isDisposed && this.observer !== null) {
      var idx = this.subject.observers.indexOf(this.observer);
      this.subject.observers.splice(idx, 1);
      this.observer = null;
    }
  }
}


function subscribe(observer) {
  if (!this.isStopped) {
    this.observers.push(observer);
    return new InnerSubscription(this, observer);
  }

  if (this.hasError) {
    observer.onError(this.error);
  } else {
    observer.onCompleted();
  }

  return disposableEmpty;
}

class BehaviorSubject extends Observable {
  constructor() {
    super(subscribe);
    this.value = undefined;
    this.observers = [];
    this.isDisposed = false;
    this.isStopped = false;
    this.hasError = false;
  }

  /**
   * Gets the current value or throws an exception.
   * Value is frozen after onCompleted is called.
   * After onError is called always throws the specified exception.
   * An exception is always thrown after dispose is called.
   * @returns {Mixed} The initial value passed to the constructor until onNext is called; after which, the last value passed to onNext.
   */
  getValue() {
    checkDisposed(this);
    if (this.hasError) {
        throw this.error;
    }
    return this.value;
  }

  /**
   * Indicates whether the subject has observers subscribed to it.
   * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
   */
  hasObservers() {
    return this.observers.length > 0;
  }

  /**
   * Notifies all subscribed observers about the end of the sequence.
   */
  onCompleted() {
    checkDisposed(this);
    if (this.isStopped) { return; }
    this.isStopped = true;
    for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
      os[i].onCompleted();
    }

    this.observers.length = 0;
  }

  /**
   * Notifies all subscribed observers about the exception.
   * @param {Mixed} error The exception to send to all observers.
   */
  onError(error) {
    checkDisposed(this);
    if (this.isStopped) { return; }
    this.isStopped = true;
    this.hasError = true;
    this.error = error;

    for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
      os[i].onError(error);
    }

    this.observers.length = 0;
  }

  /**
   * Notifies all subscribed observers about the arrival of the specified element in the sequence.
   * @param {Mixed} value The value to send to all observers.
   */
  onNext(value) {
    checkDisposed(this);
    if (this.isStopped) { return; }
    this.value = value;
    for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
      os[i].onNext(value);
    }
  }

  /**
   * Unsubscribe all observers and release resources.
   */
  dispose() {
    this.isDisposed = true;
    this.observers = null;
    this.value = null;
    this.exception = null;
  }
}