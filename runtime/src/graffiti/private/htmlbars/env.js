import hooks from './hooks';
import helpers from './helpers';
import keywords from './keywords';

export default {
  hooks: { ...hooks, keywords },
  helpers: helpers,
  useFragmentCache: true
};