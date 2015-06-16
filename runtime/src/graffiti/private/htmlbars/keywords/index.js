import debuggerKeyword from './debugger';
import onKeyword from './on';

const keywords = Object.assign({}, {
  debugger: debuggerKeyword,
  on: onKeyword
});

export function registerKeyword(name, keywordFunc) {
  keywords[name] = keywordFunc;
}

export default keywords;