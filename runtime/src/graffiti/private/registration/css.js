export const registry = {};

export function registerElementCSS(tagName, content) {
  registry[tagName] = content;
}