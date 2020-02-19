import 'regenerator-runtime';

// to prevent tests from failing
window.ga = () => {};

const context = require.context('./test', true, /\.test\.(js|jsx)$/);
context.keys().forEach(context);

const srcContext = require.context('./src', true, /\.(js|jsx)$/);
srcContext.keys().forEach(srcContext);
