import { hooks as htmlbarsHooks } from 'htmlbars-runtime';
import component from './component';

const hooks = Object.assign({}, htmlbarsHooks, {
  component
});

export default hooks;