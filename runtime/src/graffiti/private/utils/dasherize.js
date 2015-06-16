export default function dasherize(str) {
  return str
    .replace(/([A-Z])/g, '-$1')
    .substr(1)
    .toLowerCase();
}