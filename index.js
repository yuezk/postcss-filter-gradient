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

function angleToDirection(angle) {
    var result = {};
    var direction;
    var isFallback;
    var count;

    isFallback = angle % 90 !== 0;
    // handle the negtive value
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

    result.direction = direction;

    if (isFallback) {
        result.isFallback = true;
        result.message =
            'IE filter doesn\'t support angular gradient, ' +
            'we use the closest side as the fallback.';
    }

    return result;
}

// Get the gradient direction: left, right, top or bottom
function getDirection(gradient) {
    var segs;
    var angle;
    var result = {};

    if (gradient.sideCorner) {
        segs = gradient.sideCorner.split(/\s+/);
        result.direction = segs[0];
        // side corner is  `top right` or `bottm left` etc.
        if (segs.length > 1) {
            // fallback to one direction
            result.isFallback = true;
            result.message =
                'IE filter doesn\'t support side corner gradient, ' +
                'we use the first side of the side corner as fallback.';
        }
    } else if (gradient.angle.value !== undefined) {
        // treat the unit as deg
        angle = parseInt(gradient.angle.value, 10);
        result = angleToDirection(angle);
    } else {
        result.direction = 'bottom';
    }

    return result;
}

function gradientToFilter(gradient) {
    var obj = parseGradient(gradient);
    var startColor = obj.colorStops[0].color;
    var endColor = obj.colorStops.slice(-1)[0].color;
    var result = getDirection(obj);
    var direction = result.direction;
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

    return {
        string: filterGradient(startColor, endColor, type),
        isFallback: result.isFallback,
        message: result.message
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
        var len = gradients.length;
        // Only select the first gradienat if there more than one gradienats
        if (len) {
            // skip `linear-gradient`
            gradient.value = gradients[0].trim().slice(16, -1);
            gradient.decl = decl;

            if (len > 1) {
                gradient.warnings =
                    'IE filter doesn\'t support multiple gradients, ' +
                    'we pick the first as fallback.';
            }
        }
    });

    return gradient;
}

module.exports = postcss.plugin('postcss-filter-gradient', function (opts) {
    opts = opts || {};
    opts.angleFallback =
        opts.angleFallback === undefined ?  true : opts.angleFallback;

    return function (root, result) {
        root.walkRules(function (rule) {
            var gradient;
            var filter;

            if (!hasFilter(rule)) {
                gradient = getGradientFromRule(rule);

                if (gradient.warnings) {
                    gradient.decl.warn(result, gradient.warnings);
                }

                if (gradient.value) {
                    filter = gradientToFilter(gradient.value);

                    if (!opts.angleFallback && filter.isFallback) {
                        return;
                    }

                    if (filter.isFallback) {
                        gradient.decl.warn(result, filter.message);
                    }

                    gradient.decl.cloneAfter({
                        prop: 'filter', value: filter.string
                    });
                }
            } else {
                rule.warn(
                    result,
                    'The `filter` declaration already exists, ' +
                    'we have skipped this rule.'
                );
            }
        });
    };
});
