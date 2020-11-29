const { rotate, roundOff } = require('./utils');

test('rotate([1, 2, 3], 0) = [1, 2, 3]', () => {
  expect(rotate([1, 2, 3], 0)).toStrictEqual([1, 2, 3]);
});

test('rotate([1, 2, 3]) = rotate([1, 2, 3], 1) = [2, 3, 1]', () => {
  expect(rotate([1, 2, 3], 1)).toStrictEqual([2, 3, 1]);
});

test('rotate([1, 2, 3], 2) = [3, 1, 2]', () => {
  expect(rotate([1, 2, 3], 2)).toStrictEqual([3, 1, 2]);
});

test('rotate([1, 2, 3], 3) = [1, 2, 3]', () => {
  expect(rotate([1, 2, 3], 3)).toStrictEqual([1, 2, 3]);
});

test('rotate([1, 2, 3], 4) = [2, 3, 1]', () => {
  expect(rotate([1, 2, 3], 4)).toStrictEqual([2, 3, 1]);
});

test('roundOff(123.45, 1) = 123.5', () => {
  expect(roundOff(123.45, 1)).toBe(123.5);
});

test('roundOff(0.254, 2) = 0.25', () => {
  expect(roundOff(0.254, 2)).toBe(0.25);
});
