import each from './each';

const helpers = Object.assign({}, {
  each
});

export function registerHelper(name, helperFunc) {
  helpers[name] = helperFunc;
}

export default helpers;