var fs = require('fs');
var path = require('path');
var postcss = require('postcss');
var expect  = require('chai').expect;

var plugin = require('../');

var test = function (inputFile, opts, done) {
    var prefix = path.join(__dirname, '/fixtures/', inputFile);
    var input = fs.readFileSync(prefix + '.css', 'utf-8');
    var output = fs.readFileSync(prefix + '.expect.css', 'utf-8');

    postcss([plugin(opts)]).process(input).then(function (result) {
        expect(result.css).to.eql(output);
        expect(result.warnings()).to.be.empty;
        done();
    }).catch(function (error) {
        done(error);
    });
};

describe('postcss-filter-gradient', function () {
    it('should do nothing if linear-gradient not exists', function (done) {
        test('none', {}, done);
    });

    it('should ignore the old syntax', function (done) {
        test('old', {}, done);
    });

    it('should do nothing if the filter/-ms-filter present', function (done) {
        test('filter', {}, done);
    });

    it('should support the standard syntax', function (done) {
        test('standard', {}, done);
    });

    it('should support syntax which omit direction', function (done) {
        test('simple', {}, done);
    });

    it('should support vertical reverse', function (done) {
        test('vertical-reverse', {}, done);
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
        test('multi-background', {}, done);
    });

    it.skip('should support angular gradient', function (done) {
        test('angular', {}, done);
    });
});
