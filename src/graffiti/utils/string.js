export function dasherize(str) {
  return str
    .replace(/([A-Z])/g, '-$1')
    .substr(1)
    .toLowerCase();
}

export function camelize(str) {
  return str.replace(/[_-](\w|$)/g, (_, char) => char.toUpperCase());
}