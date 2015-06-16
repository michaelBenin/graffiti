import { metaFor } from '../private/utils';

export default function reflectToAttribute(attrName?: string) {
  return (target, key, { enumerable, initializer }) => {
    let hasInitialized = false;
    let value;

    if (attrName === undefined) {
      attrName = key;
    }

    return {
      // Keep these the same from the original descriptor
      key, enumerable,

      get() {
        if (hasInitialized) {
          return value;
        } else {
          hasInitialized = true;
          return value = this[key] = initializer.call(this);
        }
      },

      set(newValue) {
        const meta = metaFor(this);

        value = newValue;

        if (meta.isInitializing) {
          // Don't reflect the value during initialization
          // Otherwise it will blow any value the consumer set
          if (this.hasAttribute(attrName)) {
            return;
          }
        }

        meta.isCheckingAttributes = true;

        switch (value) {
          case true:
            this.setAttribute(attrName, '');
            break;

          case false:
          case null:
          case undefined:
            this.removeAttribute(attrName);
            break;

          default:
            this.setAttribute(attrName, '' + value);
        }
        
        meta.isCheckingAttributes = false;
      }
    };
  };
}