export function assert(msg, condition) {
  if (!condition) {
    throw 'AssertionError: ' + msg;
  }
}