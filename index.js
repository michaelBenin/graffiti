var transpiler = require('babel');
var htmlbarsCompileSpec = require('htmlbars').compileSpec;
var clone = require('clone');
var escapeQuotes = require('js-string-escape');

var defaultBabelOptions = {
  stage: 0,
  moduleIds: true,
  modules: 'amd',

  // Transforms /index.js files to use their containing directory name
  getModuleId: function (name) { 
    return name.replace(/\/index$/, '');
  },

  // Fix relative imports inside /index's
  resolveModuleSource: function (source, filename) {
    var match = filename.match(/(.+)\/index\.\S+$/i);

    // is this an import inside an /index file?
    if (match) {
      var path = match[1];
      return source
        .replace(/^\.\//, path + '/')
        .replace(/^\.\.\//, '');
    } else {
      return source;
    }
  }
};

function allInitial(tagName) {
  return [
    tagName + ',',
    tagName + ' *:not(button) {',
    '  all: initial;',
    '}',
    tagName + ' button {',
    '  -webkit-appearance: button;',
    '}'
  ].join('\n');
}
function compileCSS(input, tagName) {
  var out = input.replace(/:host/, tagName);
  return escapeQuotes(allInitial(tagName) + out);
}

function compileJavaScript(input, name) {
  var babelOptions = clone(defaultBabelOptions);
  babelOptions.filename = name;
  var out = transpiler.transform(input, babelOptions).code;
  return out + '\n require("' + name + '");';
}

function compileHTMLBars(input) {
  return '{ raw: ' + htmlbarsCompileSpec(input) + ' }';
}

function compile(component) {
  var tagName = component.name;
  var es = [
    'import { registerElementCSS, registerElementHBS } from "graffiti/private/registration";',
    component.js,
    'registerElementCSS("' + tagName + '", "' + compileCSS(component.css, tagName) + '");',
    'registerElementHBS("' + tagName + '", ' + compileHTMLBars(component.hbs)+ ');'
  ].join('\n');

  return compileJavaScript(es, tagName);
}

exports.compile = compile;
