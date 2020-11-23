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
