var postcss = require('postcss');
var list = postcss.list;
var filterGradient = require('filter-gradient');
var gradientParser = require('gradient-parser');
var DECL_FILTER = /^background(-image)?$/;

// var ANGLE_MAP = {
//     'top': 0,
//     'right': 90,
//     'bottom': 180,
//     'left': 270,
//     'top left': 315,
//     'top right': 45,
//     'bottom left': 225,
//     'bottom right': 135
// };

function hasFilter(rule) {
    var has = false;
    rule.walkDecls(/(-ms-)?filter/, function () {
        has = true;
    });
    return has;
}

function getGradientsFromDecl(decl) {
    return list.comma(decl.value).filter(function (seg) {
        return seg.indexOf('linear-gradient') === 0;
    });
}

function getGradientFromRule(rule) {
    var gradient = {};
    rule.walkDecls(DECL_FILTER, function (decl) {
        var gradients =  getGradientsFromDecl(decl);
        if (gradients.length) {
            gradient.value = gradients[0];
            gradient.decl = decl;
        }
    });

    return gradient;
}

function getColorStr(rawColor) {
    var colorStr;

    switch (rawColor.type) {
    case 'hex':
        colorStr = '#' + rawColor.value;
        break;
    case 'rgb':
        colorStr = 'rgb(' + rawColor.value.join(',') + ')';
        break;
    case 'rgba':
        colorStr = 'rgba(' + rawColor.value.join(',') + ')';
        break;
    case 'literal':
        colorStr = rawColor.value;
        break;
    default:
        colorStr = 'transparent';
        break;
    }

    return colorStr;
}

function getGradientDirection(orientation) {
    if (orientation === undefined) {
        return 'bottom';
    } else if (orientation.type === 'angular') {
        console.log(orientation.value);
    } else {
        return orientation.value;
    }
}

function getFilterFromGradient(gradient) {
    var obj = gradientParser.parse(gradient)[0];
    var startColor = getColorStr(obj.colorStops[0]);
    var endColor = getColorStr(obj.colorStops[obj.colorStops.length - 1]);
    var direction = getGradientDirection(obj.orientation);
    var type;
    var tmp;

    // Swap color if needed;
    if (/top|left/.test(direction)) {
        tmp = startColor;
        startColor = endColor;
        endColor = tmp;
    }
    // 0: vertical, 1:horizontal
    type = /top|bottom/.test(direction) ? 0 : 1;

    return filterGradient(startColor, endColor, type);
}

module.exports = postcss.plugin('postcss-filter-gradient', function (opts) {
    opts = opts || {};

    return function (root) {
        root.walkRules(function (rule) {
            var gradient;
            var filter;

            if (!hasFilter(rule)) {
                gradient = getGradientFromRule(rule);
                if (gradient.value) {
                    filter = getFilterFromGradient(gradient.value);
                    gradient.decl.cloneAfter({ prop: 'filter', value: filter });
                }
            }
        });
    };
});
