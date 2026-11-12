const ts = require('typescript');
module.exports = function (input) {
  if (this.resourcePath.endsWith('.css'))
    return `const style=document.createElement('style');style.textContent=${JSON.stringify(input)};document.head.appendChild(style);`;
  return ts.transpileModule(input, {
    fileName: this.resourcePath,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
};
