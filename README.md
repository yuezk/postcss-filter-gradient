# PostCSS Filter Gradient

[PostCSS] plugin for generating the old IE supported filter gradient..

[![Build Status][ci-img]][ci]

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/yuezk/postcss-filter-gradient.svg
[ci]:      https://travis-ci.org/yuezk/postcss-filter-gradient

```css
.foo {
    /* Input example */
    background: linear-gradient(to bottom, #1E5799, #7DB9E8);
}
```

```css
.foo {
    /* Output example */
    background: linear-gradient(to bottom, #1E5799, #7DB9E8);
    filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr='#FF1E5799', EndColorStr='#FF7DB9E8');
}
```

## Install

```sh
npm install postcss-filter-gradient --save-dev
```

## Usage

```js
postcss([ require('postcss-filter-gradient') ])
```

## Limitions

The IE filter gradient only support horizontal and vertical directions, and only support two colors. If there are more
than two colors in the color stops, we only pick the first and the last one.

## FAQ

### Does it support legacy gradient syntax?

No. We only transform the standard `linear-gradient` syntax.

You can use the [postcss-gradientfixer][postcss-gradientfixer] to unprefix it.

### Does it support angluar gradient?

Not yet. I will add it later.

## TODO

- Replace gradient parser
- Support angular gradient
- Add rgba, hls, hlsa color test case

See [PostCSS] docs for examples for your environment.

[postcss-gradientfixer]: https://github.com/hallvors/postcss-gradientfixer
