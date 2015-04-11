import { metaFor } from './utils/meta';
import { assert } from './utils/assert';
import { dasherize, camelize } from './utils/string';
import { castAttributeValue } from './utils/cast';

const { getPrototypeOf } = Object;

export class HTMLElement extends window.HTMLElement {
  constructor() {
    // Guards against calling the actual HTMLElement constructor
    // because that's not currently supported, but Babel isn't
    // smart enough know the super() call is unreachable. hehe
    false && super();
  }

  createdCallback() {
    const meta = metaFor(this);

    meta.isInitializing = true;

    // Because of a spec/browser limitation, custom elements via
    // document.registerElement doesn't include, nor call any .constructor
    // so we pretend stored it before and call it ourself here
    metaFor(getPrototypeOf(this)).elementConstructor.call(this);

    {
      // NamedNodeMap doesn't yet have iterable<Attr>
      // https://dom.spec.whatwg.org/#namednodemap
      // so can't use for..of
      const { attributes, attributes: { length } } = this;
      for (let i = 0; i < length; i++) {
        const { name, value } = attributes[i];
        castAttributeToProperty(this, name, value);
      }
    }

    meta.isInitializing = false;
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (metaFor(this).isSettingAttribute === false) {
      castAttributeToProperty(this, attrName, newValue);
    }
  }

  trigger(eventName: string, detail?: any) {
    const options = { bubbles: true, cancelable: false, detail };
    const remit = new CustomEvent(eventName, options);
    this.dispatchEvent(remit);
  }
}

function castAttributeToProperty(obj, attrName, newValue) {
  const propName = camelize(attrName);
  // This is probably buggy. What about props that
  // aren't writeable? or methods?
  if (propName in obj) {
    obj[propName] = castAttributeValue(obj[propName], newValue);
  }
}

export function registerElement(tagName: string) {
  return (target) => {  
    if (tagName === undefined) {
      tagName = dasherize(target.name.replace(/Component|Element$/, ''));
    }

    assert(`<${tagName}> must inherit from HTMLElement`, target.prototype instanceof HTMLElement);

    metaFor(target.prototype).elementConstructor = target;

    return document.registerElement(tagName, target);
  };
}

export function reflectToAttribute(attrName?: string) {
  return (target, key, { enumerable, initializer }) => {
    let value;

    if (attrName === undefined) {
      attrName = key;
    }

    return {
      // Keep these the same from the original descriptor
      key, enumerable, initializer,

      get() {
        return value;
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

        meta.isSettingAttribute = true;

        if (typeof value === 'boolean') {
          // Since attributes are truly if set, regardless of their value,
          // we set it empty if true (<tag attr>) and remove it if it's not.
          if (value === true) {
            this.setAttribute(attrName, '');
          } else {
            this.removeAttribute(attrName);
          }
        } else {
          // Values (Numbers, etc) are automatically cast for us
          // via value.toString()
          this.setAttribute(attrName, value);
        }
      }

      meta.isSettingAttribute = false;
    };
  };
}