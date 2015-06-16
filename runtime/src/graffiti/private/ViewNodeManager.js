export default class ViewNodeManager {
  constructor(component, scope, renderNode, block) {
    this.component = component;
    this.scope = scope;
    this.renderNode = renderNode;
    this.block = block;
  }

  render(env, attrs, visitor) {
    let newEnv = env;

    if (this.component) {
      newEnv = Object.assign({}, env);
      newEnv.view = this.component;
    }

    if (this.block) {
      this.block(newEnv, [], undefined, this.renderNode, this.scope, visitor);
    }
  };

  rerender(env, attrs, visitor) {
    let newEnv = env;

    if (component) {
      newEnv = Object.assign({}, env);
      newEnv.view = component;
    }

    if (this.block) {
      this.block(newEnv, [], undefined, this.renderNode, this.scope, visitor);
    }

    return newEnv;
  }
}
