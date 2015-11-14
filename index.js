var postcss = require('postcss');
var list = postcss.list;
var filterGradient = require('filter-gradient');
var DECL_FILTER = /^background(-image)?$/;

function hasFilter(rule) {
    var has = false;
    rule.walkDecls(/(-ms-)?filter/, function () {
        has = true;
    });
    return has;
}

function parseGradient(str) {
    // match 0 and any number with unit
    var rAngle = /(0|(?:[+-]?\d*\.?\d+)(deg|grad|rad|turn))/;
    // match side and any corner, in browser,
    // `top right` and `right top` are the same,
    // so we should put this situation into consideration
    /* eslint-disable max-len */
    var rSideCorner = /to\s+((?:left|right|top|bottom)|(?:(?:(?:left|right)\s+(?:top|bottom))|(?:(?:top|bottom)\s+(?:left|right))))(?=\s*,)/;
    // match color stops, the color format is not very precise
    var rColorStops = /\s*(#[0-9a-f]{3,6}|(?:hsl|rgb)a?\(.+?\)|\w+)(?:\s+((?:[+-]?\d*\.?\d+)(?:%|[a-z]+)?))?/gi;
    // the final gradient line regexp
    var rGradientLine = new RegExp('^\\s*' + rAngle.source + '|' + rSideCorner.source);
    /* eslint-enable max-len */

    var position = str.match(rGradientLine) || ['', null, 'deg', 'bottom'];
    var angle = position[1];
    var sideCorner = position[3];
    var unit = position[2];
    var stops = [];
    var stop;

    // remove the gradient line
    str = str.slice(position[0].length);

    while (stop = rColorStops.exec(str)) { // eslint-disable-line
        stops.push({
            color: stop[1],
            position: stop[2]
        });
    }

    return {
        angle: { value: angle, unit: unit },
        sideCorner: sideCorner,
        colorStops: stops
    };
}

function getGradientsFromDecl(decl) {
    return list.comma(decl.value).filter(function (seg) {
        // Only support the standard linear-gradient syntax
        return seg.indexOf('linear-gradient') === 0;
    });
}

function getGradientFromRule(rule) {
    var gradient = {};
    rule.walkDecls(DECL_FILTER, function (decl) {
        var gradients =  getGradientsFromDecl(decl);
        // Only select the first gradienat if there more than one gradienats
        if (gradients.length) {
            gradient.value = gradients[0].trim().slice(16, -1);
            gradient.decl = decl;
        }
    });

    return gradient;
}

function angleToDirection(angle) {
    var direction;
    var count;

    // handle to negtive value
    angle = (angle % 360 + 360) % 360;
    count = angle / 45;

    if (count <= 1) {
        direction = 'top';
    } else if (count <= 3) {
        direction = 'right';
    } else if (count <= 5) {
        direction = 'bottom';
    } else if (count <= 7) {
        direction = 'left';
    } else {
        direction = 'top';
    }

    return direction;
}

// Get the gradient direction: left, right, top, bottom
function getDirection(gradient) {
    var direction;
    var angle;

    if (gradient.sideCorner) {
        direction = gradient.sideCorner.split(/\s+/)[0];
    } else if (gradient.angle.value !== undefined) {
        // treat the unit as deg
        angle = parseInt(gradient.angle.value, 10);
        direction = angleToDirection(angle);
    } else {
        direction = 'bottom';
    }

    return direction;
}

function getFilterFromGradient(gradient) {
    var obj = parseGradient(gradient);
    var startColor = obj.colorStops[0].color;
    var endColor = obj.colorStops.slice(-1)[0].color;
    var direction = getDirection(obj);
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
