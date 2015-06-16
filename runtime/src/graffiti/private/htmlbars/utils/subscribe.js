import Observable from 'graffiti/private/streams/Observable';

export default function subscribe(node, env, scope, stream) {
  if (stream instanceof Observable) {
    const { component } = scope;
    stream.subscribe(function() {
      console.log('became dirty', stream, stream.getValue(), node)
      node.isDirty = true;

      // Whenever a render node directly inside a component becomes
      // dirty, we want to invoke the willRenderElement and
      // didRenderElement lifecycle hooks. From the perspective of the
      // programming model, whenever anything in the DOM changes, a
      // "re-render" has occured.
      if (component && component._renderNode) {
        component._renderNode.isDirty = true;
      } else {
        debugger;
        throw new Error('TODO: This condition actually exists!');
      }

      node.ownerNode._ownerView.scheduleRevalidate(node);
    });
  }
}