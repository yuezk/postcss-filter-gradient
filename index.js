var postcss = require('postcss');

module.exports = postcss.plugin('postcss-filter-gradient', function (opts) {
    opts = opts || {};

    // Work with options here

    return function (css, result) {

        // Transform CSS AST here

    };
});
