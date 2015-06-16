export default {
  setupState(state, env, scope, params, hash) {
    return state;
  },

  isStable(state, env, scope, params, hash) {
    return true;
  },

  render(node, env, scope, params, hash, template, inverse, visitor) {
    var eventName = params[0];
    var callback = params[1];
    var detail = params[2];
    var target = node.element;
    var delegate = env.view;

    var listener = addEventListenerViaDelegate(target, eventName, delegate, function (event) {
      switch (typeof callback) {
        case 'function':
          return callback.apply(this, arguments);
        case 'string':
          delegate.trigger(callback, detail);
          return;
        case 'undefined':
          throw new ReferenceError('Dispatch of event "' + eventName + '" failed (handler is undefined)');
        default:
          throw new TypeError('The third arguments of {{on}} must either be of type Function|string, "' + callback + '" provided.');
      }
    });

    node.cleanup = function () {
      removeEventListenerViaDelegate(target, eventName, delegate, listener);
    };
  }
};

function addEventListenerViaDelegate(target, eventName, delegate, callback) {
  var listener = function (event) {
    if (event.target === target) {
      return callback.call(this, event);
    }
  };

  delegate.addEventListener(eventName, listener);
  return listener;
}

function removeEventListenerViaDelegate(target, eventName, delegate, callback) {
  delegate.removeEventListener(eventName, listener);
}
