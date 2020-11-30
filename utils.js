exports.reverse = function reverse(arr) {
  let result = new Array(arr.length);

  for (let i = 0, j = arr.length - 1; i < arr.length; i++, j--) {
    result[i] = arr[j];
  }

  return result;
}

exports.rotate = function rotate(arr, numTimes = 1) {
  if (arr.length === 0) {
    return [];
  }

  numTimes = numTimes % arr.length;

  return arr.slice(numTimes).concat(arr.slice(0, numTimes));
}

exports.roundOff = function roundOff(num, decimalPlaces) {
  let pow = Math.pow(10, decimalPlaces);

  return Math.floor(Math.round(num * pow)) / pow;
}
