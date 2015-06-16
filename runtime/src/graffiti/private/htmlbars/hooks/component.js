import { metaFor } from '../../utils';
import { render } from 'htmlbars-runtime';

export default function componentHook(renderNode, env, scope, tagName, params, attrs, templates, visitor) {
  const renderOptions = {};
  const { contextualElement } = renderNode;

  let element;
  if (contextualElement === scope.self) {
    element = contextualElement;
    renderOptions.renderNode = renderNode;
  } else {
    element = env.dom.createElement(tagName);
    renderNode.setNode(element);
  }

  const meta = metaFor(element);
  meta.isCheckingAttributes = true;

  for (const name in attrs) {
    const value = env.hooks.getValue(attrs[name]);
    if (element.getAttribute(name) !== value) {
      element.setAttribute(name, value);
    }
  }

  meta.isCheckingAttributes = false;

  if (renderNode.lastResult) {
    renderNode.lastResult.rerender();
  } else {
    const fragment = render(templates.default, env, scope, renderOptions).fragment;
    element.appendChild(fragment);
  }



  //debugger;

  //var fragment = render(template, env, scope, {}).fragment;
  //element.appendChild(fragment);
  //morph.setNode(element);

  /*var state = renderNode.state;

  // Determine if this is an initial render or a re-render
  if (state.manager) {
    state.manager.rerender(env, attrs, visitor);
    return;
  }

  let tagName = _tagName;
  let isAngleBracket = false;

  if (tagName.charAt(0) === '<') {
    tagName = tagName.slice(1, -1);
    isAngleBracket = true;
  }

  var read = env.hooks.getValue;
  var parentView = read(scope.view);

  var manager = ComponentNodeManager.create(renderNode, env, {
    tagName,
    params,
    attrs,
    parentView,
    templates,
    isAngleBracket,
    parentScope: scope
  });

  state.manager = manager;

  manager.render(env, visitor);*/
}