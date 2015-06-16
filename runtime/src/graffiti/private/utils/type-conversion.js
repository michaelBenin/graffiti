export function attributeValueToPropertyValue(propValue, attrValue) {
  let coercedValue;

  switch (typeof propValue) {
    case 'boolean':
      // Any value except `null|undefined` is true, in regards to attributes
      coercedValue = (attrValue !== null && attrValue !== undefined);
      break;

    case 'string':
    case 'number':
      coercedValue = propValue.constructor(attrValue);
      break;

    // We can't really convert any other value without major assumptions
    // or performance issues (like POJOs, etc).
    // If someone wants this, they can decorate their the property
    // with such functionality.
    default:
      coercedValue = attrValue;
  }

  return coercedValue;
}