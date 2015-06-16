const { defineProperty, seal } = Object;

export default class Meta {
  elementConstructor = null;
  isInitializing = false;
  isCheckingAttributes = false;
  pendingAttributeChangeCount = 0;
  zone = null;

  constructor() {
    seal(this);
  }
}

// @TODO: use a WeakMap instead of storing meta on the object itself
export function metaFor(obj) {
  if (obj.hasOwnProperty('__graffiti__') === false) {
    defineProperty(obj, '__graffiti__', {
      // Defaults: NOT enumerable, configurable, or writable
      value: new Meta()
    });
  }

  return obj.__graffiti__;
}