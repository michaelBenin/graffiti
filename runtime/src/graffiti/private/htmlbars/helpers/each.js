import { get } from '../../utils';

export default function eachHelper(params, hash, blocks) {
  const list = params[0];
  const keyPath = hash.key;

  // TODO: Correct falsy semantics
  if (!list || list.length === 0) {
    if (blocks.inverse.yield) { blocks.inverse.yield(); }
    return;
  }

  list.forEach(function(item, i) {
    const key = keyPath ? get(item, keyPath) : String(i);
    blocks.template.yieldItem(key, [item, i]);
  });
}