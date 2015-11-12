var postcss = require('postcss');

module.exports = postcss.plugin('postcss-filter-gradient', function (opts) {
    opts = opts || {};
    var filter = /^background(-image)?$/;

    return function (css) {
        css.walkDecls(filter, function (decl) {

        });
    };
});
