export function castAttributeValue(propValue, attrValue) {
  let castValue;

  switch (typeof propValue) {
    case 'boolean':
      // Any value except `null|undefined` is true, in regards to attributes
      castValue = (attrValue !== null && attrValue !== undefined);
      break;

    case 'string':
    case 'number':
      castValue = propValue.constructor(attrValue);
      break;

    // We can't really cast any other value without major assumptions
    // or performance issues (like POJOs, etc).
    // If someone wants this, they can decorate their the property
    // with such functionality.
    default:
      castValue = attrValue;
  }

  return castValue;
}