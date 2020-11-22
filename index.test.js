const { convertFile } = require('.');

test('converts asterisk', () => {
  let svgResult = convertFile('./testdata/asterisk.psd').toString();
  expect(svgResult).toMatchSnapshot();
});
