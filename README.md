# PostCSS Filter Gradient

[PostCSS] plugin for generating the old IE supported filter gradient.

[![Build Status][ci-img]][ci]
[![Coverage Status][co-img]][co]

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/yuezk/postcss-filter-gradient.svg
[ci]:      https://travis-ci.org/yuezk/postcss-filter-gradient
[co-img]: https://coveralls.io/repos/github/yuezk/postcss-filter-gradient/badge.svg?branch=master
[co]: https://coveralls.io/github/yuezk/postcss-filter-gradient?branch=master

```css
.foo {
    /* Input example */
    background: linear-gradient(to bottom, #1e5799, #7db9e8);
}
```

```css
.foo {
    /* Output example */
    background: linear-gradient(to bottom, #1e5799, #7db9e8);
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff1e5799', endColorstr='#ff7db9e8', GradientType=0);
}
```

## Install

For `postcss 6.x`:

```sh
npm install postcss-filter-gradient --save-dev
```

and for `postcss 5.x`

```sh
npm install postcss-filter-gradient@0.x --save-dev
```

## Usage

```js
postcss([ require('postcss-filter-gradient') ])
```

## Options

### angleFallback

Default: `true`

IE filter doesn't support angular gradient. By default, when processing the angular gradient,
we will convert the angle to its closest direction. You can disable this feature by setting this option to `false`.

### skipMultiColor

Default: `false`

If set to `true`, we will not handle the rules which have multi color stops. It is useful when you want use a
background color as fallback.

### skipWarnings

Default: `false`

If set to `true`, all warnings will be suppressed.

## Limitation

The IE filter gradient only support horizontal and vertical directions, and only support two colors. So, if there are more
than two colors in the color stops, we only pick the first and the last one. You can skip it by setting
`option.skipMultiColor` to `true`.

## FAQ

### Does it support legacy gradient syntax?

No. We only transform the standard `linear-gradient` syntax.

You can use the [postcss-gradientfixer][postcss-gradientfixer] to unprefix it first.

### Does it support angluar gradient?

Yes. This plugin only support `deg` unit. It will convert angular to the closest direction. For example, it convert `90deg` to `right`
and convert `10deg` to `top`, positive angluar are also supported.

See [PostCSS] docs for examples for your environment.

## [CHANGELOG](CHANGELOG.md)

## LICENSE

[MIT](LICENSE)

[postcss-gradientfixer]: https://github.com/hallvors/postcss-gradientfixer
