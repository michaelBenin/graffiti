export const registry = {};

export function registerElementHBS(tagName, content) {
  registry[tagName] = content;
}