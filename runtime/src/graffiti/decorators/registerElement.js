import ComponentMixin from '../mixins/Component';
import { metaFor, dasherize, assert } from '../private/utils';

export default function registerElement(tagName: string) {
  return (target) => {  
    if (tagName === undefined) {
      tagName = dasherize(target.name.replace(/Component|Element$/, ''));
    }

    assert(`<${tagName}> must inherit from HTMLElement or SVGElement`, target.prototype instanceof HTMLElement || target.prototype instanceof SVGElement);

    metaFor(target.prototype).elementConstructor = target;

    Object.assign(target.prototype, ComponentMixin);
  
    Object.getPrototypeOf(target.prototype).constructor = function () {
      // Guards against calling the actual HTMLElement|SVGElement constructor
      // because that's not currently supported
    };

    // @TODO: the *actual* constructor to create the
    // element is being lost here...but if we return it,
    // it breaks inheritance model.
    document.registerElement(tagName, target);

    return target;
  };
}