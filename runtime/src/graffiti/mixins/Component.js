import Renderer, { renderHTMLBarsBlock } from '../private/Renderer';
import DOMHelper from '../private/DOMHelper';
import { metaFor, camelize, attributeValueToPropertyValue } from '../private/utils';
import { compile } from 'htmlbars-compiler';
import { registry as cssRegistry } from '../private/registration/css';
import { registry as hbsRegistry } from '../private/registration/hbs';

const { getPrototypeOf } = Object;

export default {
  setAttribute(key, value) {
    const meta = metaFor(this);

    if (meta.isCheckingAttributes && this.getAttribute(key) !== '' + value) {
      meta.pendingAttributeChangeCount++;
    }

    // @TODO: can't use super.setAttribute() because of babel bug
    // but this doesn't handle SVG!
    return HTMLElement.prototype.setAttribute.apply(this, arguments);
  },

  removeAttribute(key) {
    const meta = metaFor(this);

    if (meta.isCheckingAttributes && this.hasAttribute(key)) {
      meta.pendingAttributeChangeCount++;
    }

    // @TODO: can't use super.removeAttribute() because of babel bug
    // but this doesn't handle SVG!
    return HTMLElement.prototype.removeAttribute.apply(this, arguments);
  },

  createdCallback() {
    const meta = metaFor(this);

    meta.isInitializing = true;

    // Because of a spec/browser limitation, custom elements via
    // document.registerElement doesn't include, nor call any .constructor
    // so we store it and call it ourself here
    metaFor(getPrototypeOf(this)).elementConstructor.call(this);

    {
      // NamedNodeMap doesn't yet have iterable<Attr>
      // https://dom.spec.whatwg.org/#namednodemap
      // so can't use for..of
      const { attributes, attributes: { length } } = this;
      for (let i = 0; i < length; i++) {
        const { name, value } = attributes[i];
        coerceAttributeToProperty(this, name, value);
      }
    }

    if (this.events) {
      const eventKeys = Object.keys(this.events);
      for (let i = 0, l = eventKeys.length; i < l; i++) {
        this.addEventListener(eventKeys[i], this.events[eventKeys[i]]);
      }
    }

    wrapPropertiesInZone(this);

    // @TODO move renderer to meta (requires changing renderHTMLBarsBlock)
    this.renderer = new Renderer(new DOMHelper());

    this.template = hbsRegistry[this.tagName.toLowerCase()];

    const mountZone = metaFor(this).zone = zone.fork({
      ...Zone.longStackTraceZone,

      afterTask: () => {
        meta.isCheckingAttributes === true;
        this._renderNode.lastResult.rerender();
        meta.isCheckingAttributes === false;
      }
    });

    mountZone.run(function () {
      meta.isCheckingAttributes === true;
      this.renderer.renderInner(this);
      injectStyle(cssRegistry[this.tagName.toLowerCase()]);
      meta.isCheckingAttributes === false;
    }, this);

    meta.isInitializing = false;
  },

  attributeChangedCallback(attrName, oldValue, newValue) {
    this.run(function () {
      const meta = metaFor(this);
      if (meta.pendingAttributeChangeCount === 0) {
        coerceAttributeToProperty(this, attrName, newValue);
      } else {
        meta.pendingAttributeChangeCount--;
      }
    });
  },

  willRender() {},
  
  renderBlock(block, renderNode) {
    return renderHTMLBarsBlock(this, block, renderNode);
  },

  rerender() {
    this.renderer.rerender();
  },

  revalidate() {
    this.renderer.revalidateTopLevelView(this);
  },

  run(fn) {
    metaFor(this).zone.run(fn, this);
  },

  trigger(eventName: string, detail?: any) {
    var options = { bubbles: true, cancelable: false, detail: detail };
    var remit = new CustomEvent(eventName, options);
    this.dispatchEvent(remit);
  }
}

function coerceAttributeToProperty(obj, attrName, newValue) {
  const propName = camelize(attrName);
  // @TODO: What about props that aren't writeable? or methods?
  if (propName in obj) {
    obj[propName] = attributeValueToPropertyValue(obj[propName], newValue);
  }
}

function wrapPropertiesInZone(obj) {
  for (const key in obj) {
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    if (obj.hasOwnProperty(key)) {
      if (desc && typeof desc.value !== 'function') {
        wrapPropertyInZone(obj, key);
      }
    }
  }
}

function wrapPropertyInZone(obj, key) {
  var value = obj[key];

  Object.defineProperty(obj, key, {
    get() {
      return value;
    },
    set(newValue) {
      this.run(function () {
        value = newValue;
      });
    }
  });
}

function injectStyle(content) {
  var style = document.createElement('style');
  style.appendChild(document.createTextNode(content));
  document.head.insertBefore(style, document.head.firstChild);
}