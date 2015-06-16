export default function debuggerKeyword(morph, env, scope) {
  /* jshint unused: false, debug: true */

  var view = env.hooks.getValue(scope.locals.view);
  var context = env.hooks.getValue(scope.self);

  function get(path) {
    return env.hooks.getValue(env.hooks.get(env, scope, path));
  }

  console.log('Use `view`, `context`, and `get(<path>)` to debug this template.');

  debugger;

  return true;
}