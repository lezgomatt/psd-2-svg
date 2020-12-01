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
