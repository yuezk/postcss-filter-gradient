var fs = require('fs');
var path = require('path');
var postcss = require('postcss');
var expect  = require('chai').expect;

var plugin = require('../');

var test = function (inputFile, opts, done, warnings) {
    var prefix = path.join(__dirname, '/fixtures/', inputFile);
    var input = fs.readFileSync(prefix + '.css', 'utf-8');
    var output = fs.readFileSync(prefix + '.expect.css', 'utf-8');

    postcss([plugin(opts)]).process(input).then(function (result) {
        expect(result.css).to.eql(output);
        if (warnings) {
            result.warnings().forEach(function (warn, i) {
                var expectedWarning = Array.isArray(warnings) ? warnings[i] : warnings;
                expect(warn.text).to.eql(expectedWarning);
            });
        } else {
            expect(result.warnings()).to.be.empty;
        }
        done();
    }).catch(function (error) {
        done(error);
    });
};

describe('postcss-filter-gradient', function () {
    it('should not throw errors when `options` is undefined', function (done) {
        expect(plugin).to.not.throw();
        done();
    });

    it('should do nothing if linear-gradient not exists', function (done) {
        test('none', {}, done);
    });

    it('should ignore the old syntax', function (done) {
        test('old', {}, done);
    });

    it('should do nothing if the filter/-ms-filter present', function (done) {
        var warnings =
            'The `filter` declaration already exists, ' +
            'we have skipped this rule.';

        test('filter', {}, done, warnings);
    });

    it('should not waring when linear-gradient does\'nt exists', function (done) {
        test('filter-not-warning', { }, done);
    });

    it('should do nothing when handle invalid linear gradient syntax', function (done) {
        var warnings = [
            '`linear-gradient()` is not a valid linear gradient value.',
            '`linear-gradient(#000)` is not a valid linear gradient value.'
        ];

        test('invalid-syntax', {}, done, warnings);
    });

    it('should do nothing when the color format is not valid', function (done) {
        var warnings = [
            'Unable to parse color from string "#ffff" in `linear-gradient(#ffff, #000)`',
            'Unable to parse color from string "invalidColor" in `linear-gradient(to bottom, #000, invalidColor)`'
        ];

        test('invalid-color', {}, done, warnings);
    });

    it('should support the standard syntax', function (done) {
        test('standard', {}, done);
    });

    it('should support syntax which omit direction', function (done) {
        test('simple', {}, done);
    });

    it('should support top', function (done) {
        test('top', {}, done);
    });

    it('should support bottom', function (done) {
        test('bottom', {}, done);
    });

    it('should support vertical reverse', function (done) {
        test('vertical-reverse', {}, done);
    });

    it('should support right', function (done) {
        test('right', {}, done);
    });

    it('should support left', function (done) {
        test('left', {}, done);
    });

    it('should support horizontal direction', function (done) {
        test('horizontal', {}, done);
    });

    it('should support horizontal reverse', function (done) {
        test('horizontal-reverse', {}, done);
    });

    it('should support multi color stops', function (done) {
        test('multi-colorstops', {}, done);
    });

    it('should support multi background', function (done) {
        var warnings =
            'IE filter doesn\'t support multiple gradients, ' +
            'we pick the first as fallback.';
        test('multi-background', {}, done, warnings);
    });

    it('should support multi color format', function (done) {
        test('color-format', {}, done);
    });

    it('should support angular gradient', function (done) {
        test('angular', {}, done);
    });

    it('should support fallback when use angular gradient',
        function (done) {
            var warnings =
                'IE filter doesn\'t support angular gradient, ' +
                'we use the closest side as the fallback.';
            test('angular-fallback', {}, done, warnings);
        }
    );

    it('should support fallback when use side corner gradient',
        function (done) {
            var warnings =
                'IE filter doesn\'t support side corner gradient, ' +
                'we use the first side of the side corner as fallback.';

            test('sidecorner-fallback', {}, done, warnings);
        }
    );

    describe('options.skipWarnings', function () {
        var fixtures = [
            'filter',
            'invalid-syntax',
            'invalid-color',
            'multi-background',
            'angular-fallback',
            'sidecorner-fallback'
        ];

        fixtures.forEach(function (f) {
            it('should skip `' + f + '` warnings', function (done) {
                test(f, { skipWarnings: true }, done);
            });
        });
    });

    it('should disable angle fallback when `option.angleFallback` is true',
        function (done) {
            test('option-angle-fallback', { angleFallback: false }, done);
        }
    );

    it('shouldnt handle multi colorstops when `option.skipMultiColor` is true',
       function (done) {
           test('option-skip-multicolor', { skipMultiColor: true }, done);
       }
    );

    it('should handle the `grad` unit correctly', function (done) {
        test('grad', {}, done);
    });

    it('should handle the `rad` unit correctly', function (done) {
        test('rad', {}, done);
    });

    it('should handle the `turn` unit correctly', function (done) {
        test('turn', {}, done);
    });

    it('should handle the one-liner background syntax', function (done) {
        test('one-liner', {}, done);
    });
});
