exports.rotate = function rotate(arr, numTimes) {
  if (arr.length === 0) {
    return [];
  }

  numTimes = numTimes % arr.length;

  return arr.slice(numTimes).concat(arr.slice(0, numTimes));
}

exports.last = function last(arr) {
  return arr[arr.length - 1];
}
