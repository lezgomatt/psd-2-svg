exports.rotate = function rotate(arr, numTimes) {
  return arr.slice(numTimes).concat(arr.slice(0, numTimes));
}

exports.last = function last(arr) {
  return arr[arr.length - 1];
}
