var countType = function (parsedArray) {
  var dataCount = { array: 0, string: 0, number: 0, bool: 0 };
  parsedArray.forEach(function (data) {
    dataCount[data]++;
  })
  return dataCount;
}
