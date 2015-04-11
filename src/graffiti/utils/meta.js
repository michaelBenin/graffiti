const { defineProperty, seal } = Object;

export default class Meta {
  elementConstructor: Function = null;
  isInitializing = false;
  isSettingAttribute = false;

  constructor() {
    seal(this);
  }
}

export function metaFor(obj) {
  if (obj.hasOwnProperty('__graffiti__') === false) {
    defineProperty(obj, '__graffiti__', {
      // Defaults: NOT enumerable, configurable, or writable
      value: new Meta()
    });
  }

  return obj.__graffiti__;
}