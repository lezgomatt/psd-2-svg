const { last, rotate } = require('./utils');

test('last([1]) = 1', () => {
  expect(last([1])).toBe(1);
});

test('last([1, 2, 3]) = 3', () => {
  expect(last([1, 2, 3])).toBe(3);
});

test('rotate([1, 2, 3], 0) = [1, 2, 3]', () => {
  expect(rotate([1, 2, 3], 0)).toStrictEqual([1, 2, 3]);
});

test('rotate([1, 2, 3], 2) = [3, 1, 2]', () => {
  expect(rotate([1, 2, 3], 2)).toStrictEqual([3, 1, 2]);
});

test('rotate([1, 2, 3], 4) = [2, 3, 1]', () => {
  expect(rotate([1, 2, 3], 4)).toStrictEqual([2, 3, 1]);
});
