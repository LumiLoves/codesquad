var errors = require('./errors');

var jsonParser = (function () {
  var JsonData = function (insertedData, parsingPointer, dataEndPoint, parsedData) {
    this.insertedData = insertedData;
    this.parsingPointer = parsingPointer;
    this.dataEndPoint = dataEndPoint;
    this.parsedData = parsedData;
  }

  Object.defineProperty(JsonData.prototype, "parsingLetter",
    { get: function () { return this.insertedData[this.parsingPointer]; } }
  );

  var parse = function (insertedData) {
    var jsonData = new JsonData(insertedData, 0, insertedData.length - 1, []);
    return parseData(jsonData);
  }

  var parseData = function (jsonData) {
    if (jsonData.insertedData.length === 1) {
      throw new Error(errors.type);
    }

    while (jsonData.parsingPointer < jsonData.insertedData.length) {
      ignoreSpaces(jsonData);

      if (jsonData.parsingPointer >= jsonData.dataEndPoint) {
        return jsonData.parsedData;
      }

      var dataType = getNextType(jsonData);
      if (dataType === "Array") {
        parseArray(jsonData);
      } else {
        parseValue(jsonData, dataType);
      }

      if (jsonData.parsingPointer === jsonData.insertedData.length) {
        return jsonData.parsedData;
      }
    }

    throw new Error(errors.blockError);
  }

  var parseArray = function (jsonData) {
    var arrayEnd = getBlockEnd(jsonData);
    var innerData = new JsonData(jsonData.insertedData, jsonData.parsingPointer + 1, arrayEnd, []);
    jsonData.parsedData.push(parseData(innerData));
    jsonData.parsingPointer = arrayEnd + 1;

    if (jsonData.parsingPointer === jsonData.insertedData.length) {
      return;
    }

    jsonData.parsingPointer = getDelimiter(jsonData) + 1;
  }

  var parseValue = function (jsonData, valueType) {
    var valueEnd = getElementEnd(jsonData);
    var pureValueEnd = exceptLastSpaces(jsonData, jsonData.parsingPointer, valueEnd);
    jsonData.parsedData.push(parseType[valueType](jsonData, jsonData.parsingPointer, pureValueEnd));
    jsonData.parsingPointer = valueEnd + 1;
  }

  var ignoreSpaces = function (jsonData) {
    while (jsonData.parsingLetter === " ") {
      jsonData.parsingPointer++;
    }
  }

  var getNextType = function (jsonData) {
    if (jsonData.parsingLetter === '[') return "Array";
    if (jsonData.parsingLetter === '"') return "String";
    if (/-|[1-9]/.test(jsonData.parsingLetter)) return "Number";
    if (/t|f/i.test(jsonData.parsingLetter)) return "Bool";
    throw new Error(errors.typeError);
  }

  var getBlockEnd = function (jsonData) {
    var innerArrayCount = 0
    var endPointer = jsonData.parsingPointer;

    for (; endPointer <= jsonData.dataEndPoint; endPointer++) {
      if (jsonData.insertedData[endPointer] === '[') innerArrayCount++;
      if (jsonData.insertedData[endPointer] === ']') innerArrayCount--;
      if (jsonData.insertedData[endPointer] === '"') endPointer = getStringEnd(jsonData, endPointer);
      if (innerArrayCount === 0) {
        return endPointer;
      }
    }

    throw new Error(errors.blockError);
  }

  var getElementEnd = function (jsonData) {
    var endPointer = (jsonData.parsingLetter === '"') ? getStringEnd(jsonData, jsonData.parsingPointer) : jsonData.parsingPointer

    for (; endPointer <= jsonData.dataEndPoint; endPointer++) {
      if (jsonData.insertedData[endPointer] === ']' || jsonData.insertedData[endPointer] === ',') {
        return endPointer;
      }
    }

    throw new Error(errors.typeError);
  }

  var getStringEnd = function (jsonData, startPoint) {
    var endPointer = startPoint + 1;

    while (jsonData.insertedData[endPointer] !== '"') {
      endPointer++;

      if (endPointer > jsonData.dataEndPoint) {
        throw new Error(errors.typeError);
      }
    }

    return endPointer;
  }

  var getDelimiter = function (jsonData) {
    var delimiterPointer = jsonData.parsingPointer;

    for (; delimiterPointer <= jsonData.dataEndPoint; delimiterPointer++) {

      if (jsonData.insertedData[delimiterPointer] === ']' || jsonData.insertedData[delimiterPointer] === ',') {
        return delimiterPointer;
      }

      if (jsonData.insertedData[delimiterPointer] !== ' ') {
        throw new Error(errors.blockError);
      }
    }

    throw new Error(errors.blockError);
  }

  var parseType = {
    Number: function (jsonData, startPoint, endPoint) {
      var number = Number(jsonData.insertedData.slice(startPoint, endPoint));

      if (!isNaN(number)) {
        return number;
      }

      throw new Error(errors.typeError);
    },

    Bool: function (jsonData, startPoint, endPoint) {
      var parsingBool = insertedData.slice(startPoint, endPoint).toLowerCase();

      if (parsingBool === "true") return true;
      if (parsingBool === "false") return false;

      throw new Error(errors.typeError);
    },

    String: function (jsonData, startPoint, endPoint) {
      var parsingString = "";

      for (var i = 1; startPoint + i < endPoint - 1; i++) {
        if (jsonData.insertedData[startPoint + i] === '"' || jsonData.insertedData[startPoint + i] === '\\') {
          throw new Error(errors.typeError);
        }

        parsingString += jsonData.insertedData[startPoint + i];
      }

      return parsingString;
    }
  }

  var exceptLastSpaces = function (jsonData, startPoint, endPoint) {
    while (jsonData.insertedData[endPoint] === ' ') {
      endPoint--;

      if (endPoint < startPoint) {
        throw new Error(errors.typeError);
      }
    }

    return endPoint;
  }

  return {
    parse
  }

})();

module.exports = jsonParser;