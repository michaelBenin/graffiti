import { render, internal as htmlbarsInteral } from 'htmlbars-runtime';
import { assert } from './utils';

export default class Renderer {
  constructor(domHelper) {
    this._dom = domHelper;
  }

  prerenderTopLevelView(view, renderNode) {
    if (view._state === 'inDOM') {
      throw new Error('You cannot insert a view that has already been rendered');
    }

    view._ownerView = renderNode._ownerView = view;
    view._renderNode = renderNode;

    const { layout, template } = view;
    const componentInfo = { component: view, view, layout };

    const block = buildComponentTemplate(componentInfo, {}, {
      self: view,
      template: template && template.raw
    }).block;

    view.renderBlock(block, renderNode);
    view.lastResult = renderNode.lastResult;

    this.clearRenderedViews(view.env);
  }

  renderTopLevelView(view, renderNode) {
    // Check to see if insertion has been canceled
    if (view._willInsert) {
      view._willInsert = false;
      this.prerenderTopLevelView(view, renderNode);
      this.dispatchLifecycleHooks(view.env);
    }
  }

  revalidateTopLevelView({ _renderNode: renderNode, _state: viewState, env }) {
    // This guard prevents revalidation on an already-destroyed view.
    if (renderNode.lastResult) {
      renderNode.lastResult.revalidate(env);
      // supports createElement, which operates without moving the view into
      // the inDOM state.
      if (viewState === 'inDOM') {
        this.dispatchLifecycleHooks(env);
      }

      this.clearRenderedViews(env);
    }
  }

  dispatchLifecycleHooks({ view: ownerView, lifecycleHooks }) {
    // @TODO: is `view` actually ever different than `ownerView`??
    for (const { type, view  } of lifecycleHooks) {
      ownerView._dispatching = type;

      switch (type) {
        case 'didInsertElement':
          this.didInsertElement(view);
          break;

        case 'didUpdate':
          this.didUpdate(view);
          break;

        default:
          throw new Error(`Unhandled lifecycle hook: ${type}`);
      }

      this.didRender(view);
    }

    ownerView._dispatching = null;
    lifecycleHooks.length = 0;
  }

  didInsertElement(view) {
    if (view._transitionTo) {
      view._transitionTo('inDOM');
    }

    if (view.trigger) {
      view.trigger('didInsertElement');
    }
  }

  didUpdate(view) {
    if (view.trigger) {
      view.trigger('didUpdate');
    }
  }

  didRender(view) {
    if (view.trigger) {
      view.trigger('didRender');
    }
  }

  clearRenderedViews(env) {
    env.renderedViews.length = 0;
  }

  renderInner(view) {
    /*const morph = this._dom.createElementMorph(view, view.namespaceURI);
    morph.ownerNode = morph;
    morph.isRootNode = true;*/
    view._willInsert = true;

    const contentNodes = document.createDocumentFragment();
    
    {
      const { childNodes } = view;
      for (let i = 0, l = childNodes.length; i < l;i++) {
        contentNodes.appendChild(childNodes[i]);
      }
    }

    const innerMorph = this._dom.insertMorphBefore(view, view.firstChild, view);
    //const innerMorph = this._dom.replaceContentWithMorph(view);
    
    innerMorph.ownerNode = innerMorph;

    this.renderTopLevelView(view, innerMorph);
    
    var content = view.getElementsByTagName('content')[0];
    if (content) {
      content.parentNode.replaceChild(contentNodes, content);
    }
  }
}

export function buildComponentTemplate({ component = null, layout }, attrs, content) {
  let tagName = null;
  let blockToRender;

  if (content.template) {
    blockToRender = createContentBlock(content.template, content.scope, content.self, component);
  }

  if (layout && layout.raw) {
    blockToRender = createLayoutBlock(layout.raw, blockToRender, content.self, component, attrs);
  }

  return { createdElement: false, block: blockToRender };
}

function blockFor(template, options) {
  assert(!!template, 'BUG: Must pass a template to blockFor');
  return htmlbarsInteral.blockFor(render, template, options);
}

function createContentBlock(template, scope, self, component) {
  assert(!(scope && self), 'BUG: buildComponentTemplate can take a scope or a self, but not both');

  return blockFor(template, {
    scope: scope,
    self: self,
    options: { view: component }
  });
}

import ViewNodeManager from './ViewNodeManager';
import defaultEnv from './htmlbars/env';

export function renderHTMLBarsBlock(view, block, renderNode) {
  var env = {
    lifecycleHooks: [],
    renderedViews: [],
    view: view,
    outletState: view.outletState,
    container: view.container,
    renderer: view.renderer,
    dom: view.renderer._dom,
    hooks: defaultEnv.hooks,
    helpers: defaultEnv.helpers,
    useFragmentCache: defaultEnv.useFragmentCache
  };

  view.env = env;
  //createOrUpdateComponent(view, {}, null, renderNode, env);
  const nodeManager = new ViewNodeManager(view, null, renderNode, block, view._ownerView !== view);

  nodeManager.render(env, {});
}
