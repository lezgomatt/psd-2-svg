const { convertFile } = require('.');

test('converts asterisk', () => {
  let svgResult = convertFile('./testdata/asterisk.psd').toString();
  expect(svgResult).toMatchSnapshot();
});

test('converts bed', () => {
  let svgResult = convertFile('./testdata/bed.psd').toString();
  expect(svgResult).toMatchSnapshot();
});

test('converts like', () => {
  let svgResult = convertFile('./testdata/like.psd').toString();
  expect(svgResult).toMatchSnapshot();
});

test('converts shapes', () => {
  let svgResult = convertFile('./testdata/shapes.psd').toString();
  expect(svgResult).toMatchSnapshot();
});

test('converts layers', () => {
  let svgResult = convertFile('./testdata/layers.psd').toString();
  expect(svgResult).toMatchSnapshot();
});

test('converts strokes', () => {
  let svgResult = convertFile('./testdata/strokes.psd').toString();
  expect(svgResult).toMatchSnapshot();
});

test('converts lines', () => {
  let svgResult = convertFile('./testdata/lines.psd').toString();
  expect(svgResult).toMatchSnapshot();
});

test('converts stroke-pos', () => {
  let svgResult = convertFile('./testdata/stroke-pos.psd').toString();
  expect(svgResult).toMatchSnapshot();
});

test('converts dashes', () => {
  let svgResult = convertFile('./testdata/dashes.psd').toString();
  expect(svgResult).toMatchSnapshot();
});

test('converts special-name', () => {
  let svgResult = convertFile('./testdata/special-name.psd').toString();
  expect(svgResult).toMatchSnapshot();
});
