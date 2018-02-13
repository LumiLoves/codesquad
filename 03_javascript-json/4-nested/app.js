var readline = require('readline');
var r = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


/**
 * Util
 */

var util = {
  array: {
    trim: function(arr) {
      if (toString.call(arr) !== '[object Array]') { return false; }

      if (arr[0] === ' ') { arr.shift(); }
      if (arr[arr.length - 1] === ' ') { arr.pop(); }
      if (arr[0] === ' ' || arr[arr.length - 1] === ' ') { this.trim(arr); }

      return arr;
    }
  },
  type: {
    isString: function(data) {
      return toString.call(data) === '[object String]';
    },
    isArray: function(data) {
      return (Array.isArray !== undefined)? 
        Array.isArray(data) : (toString.call(data) === '[object Array]');
    }
  }
};


/**
 *  Letter 
 */

var letter = {
  'COMMA': ',',
  'COLON': ':',
  'DOUBLE_QUOTATION': '"',  
  'LEFT_CURLY_BRACKET': '{',
  'RIGHT_CURLY_BRACKET': '}',
  'LEFT_SQUARE_BRACKET': '[',
  'RIGHT_SQUARE_BRACKET': ']',
  'LEFT_BRACKET': [ '[', '{' ],
  'RIGHT_BRACKET': [ ']', '}' ],

  checkLetter: function(gubunKey, currentLetter) {
    var gubunVal = this[gubunKey];
    
    if (util.type.isString(gubunVal)) { return gubunVal === currentLetter; }
    if (util.type.isArray(gubunVal)) { return gubunVal.indexOf(currentLetter) > -1; }
  },
  isArrayBrackets: function(leftBracket, rightBracket) {
    return this.checkLetter('LEFT_SQUARE_BRACKET', leftBracket) && this.checkLetter('RIGHT_SQUARE_BRACKET', rightBracket);
  },
  isObjectBrackets: function(leftBracket, rightBracket) {
    return this.checkLetter('LEFT_CURLY_BRACKET', leftBracket) && this.checkLetter('RIGHT_CURLY_BRACKET', rightBracket);
  },
  isCuttingComma: function(currentLetter, token) {
    currentLetter = currentLetter.trim();
    token = util.array.trim(token);

    var firstLetter = token[0];
    var lastLetter = token[token.length - 1];

    // 스트링("") 내부에 있는 Comma인지 체크 (ex : ",")
    if (this.checkLetter('DOUBLE_QUOTATION', firstLetter)) {
      return this.checkLetter('COMMA', currentLetter) && this.checkLetter('DOUBLE_QUOTATION', lastLetter);
    }

    // 객체({}) 내부에 있는 Comma인지 체크 (ex : {,,,} , { } )
    if (this.checkLetter('LEFT_CURLY_BRACKET', firstLetter)) {
      return this.checkLetter('COMMA', currentLetter) && this.checkLetter('RIGHT_CURLY_BRACKET', lastLetter);
    }

    // 배열([]) 내부에 있는 Comma인지 체크 (ex : [,,,] , [ ] )
    if (this.checkLetter('LEFT_SQUARE_BRACKET', firstLetter)) {
      return this.checkLetter('COMMA', currentLetter) && this.checkLetter('RIGHT_SQUARE_BRACKET', lastLetter);
    }

    return this.checkLetter('COMMA', currentLetter);
  }
};


/**
 * 타입 분석기 (결과값 : 문자열, 숫자, 불린, 객체, 배열)
 */

var typeChecker = {
  getType: function(token) {
    var token = util.array.trim(token);  
    var tokenType = null;

    if (token.join('').trim() === '') { return; }

    [ 'string', 'number', 'boolean', 'object', 'array' ].some(function(elem, i) {
      var funcName = '_is' + elem[0].toUpperCase() + elem.slice(1);

      if (this[funcName](token)) {
        tokenType = elem;    
        return true;        
      }
    }.bind(this));

    return tokenType;
  },

  _isString: function(token) {
    var haveFirstDoubleQuotation = letter.checkLetter('DOUBLE_QUOTATION', token[0]);
    var haveLastDoubleQuotation = letter.checkLetter('DOUBLE_QUOTATION', token[token.length - 1]);
    var doubleQuotationArr = token.filter(function(elem) {
      return letter.checkLetter('DOUBLE_QUOTATION', elem);
    });

    return haveFirstDoubleQuotation && haveLastDoubleQuotation && (doubleQuotationArr.length === 2);
  },
  _isNumber: function(token) {
    if (util.type.isArray(token)) { token = token.join('').trim(); }
    return !isNaN(token);
  },
  _isBoolean: function(token) {
    if (util.type.isArray(token)) { token = token.join('').trim(); }
    return [ 'true', 'false' ].indexOf(token) > -1;
  },
  _isObject: function(token) {
    var haveFirstCurlyBracket = letter.checkLetter('LEFT_CURLY_BRACKET', token[0]);
    var haveLastCurlyBracket = letter.checkLetter('RIGHT_CURLY_BRACKET', token[token.length - 1]);
    var curlyBracketArr = token.filter(function(elem) {
      return [ '{', '}' ].indexOf(elem) > -1;
    });

    return haveFirstCurlyBracket && haveLastCurlyBracket && (curlyBracketArr.length % 2 === 0);
  },
  _isArray: function(token) {
    var haveFirstSquareBracket = letter.checkLetter('LEFT_SQUARE_BRACKET', token[0]);
    var haveLastSquareBracket = letter.checkLetter('RIGHT_SQUARE_BRACKET', token[token.length - 1]);
    var squareBracketArr = token.filter(function(elem) {
      return [ '[', ']' ].indexOf(elem) > -1;
    });

    return haveFirstSquareBracket && haveLastSquareBracket && (squareBracketArr.length % 2 === 0);    
  }
};


/**
 *  Parser
 */

var parser = {
  init: function() {
    this.returnStack = [];  // [ { JSONStr: '...', startIndex: 10 }, { ... } ]
    this.globalDepth = 0;
    this.currentDepth = 0;
    this.counter = { total: 0, string: 0, number: 0, boolean: 0, object: 0, array: 0 };
  },
  run: function(JSONStr, startIndex) {
    if (util.type.isString(JSONStr)) { JSONStr = JSONStr.trim(); }

    var firstJSONStr = JSONStr[0];
    var lastJSONStr = JSONStr[JSONStr.length - 1];

    if (letter.isArrayBrackets(firstJSONStr, lastJSONStr)) {
      this._initTargetData('array');
      this._parseJSON(JSONStr, startIndex);      
      return;
    }

    if (letter.isObjectBrackets(firstJSONStr, lastJSONStr)) { 
      this._initTargetData('object');      
      this._parseJSON(JSONStr, startIndex);
      return;
    }

    message.showNotSupportType();
  },

  /* parser 내부 data 조작 */

  _initTargetData: function(targetType) {
    var bracketMethod = {
      array: {
        isStartBracket: letter.checkLetter.bind(letter, 'LEFT_SQUARE_BRACKET'),
        isEndBracket: letter.checkLetter.bind(letter, 'RIGHT_SQUARE_BRACKET')        
      },
      object: {
        isStartBracket: letter.checkLetter.bind(letter, 'LEFT_CURLY_BRACKET'),
        isEndBracket: letter.checkLetter.bind(letter, 'RIGHT_CURLY_BRACKET')
      }
    }[targetType];

    this.target = {
      type: targetType,
      checkStartBracket: bracketMethod.isStartBracket,
      checkEndBracket: bracketMethod.isEndBracket
    };
  },
  _moveDepth: function(depthName, direction) {
    if (direction === 'up') { this[depthName]++; }
    if (direction === 'down') { this[depthName]--; }
  },
  _addCount: function(selectedType) {
    this.counter.total++;        
    this.counter[selectedType]++;
  },

  /* parser가 탐색중인 문자의 위치가 어디에 있는지 체크 */

  _isRunningInsideString: function(token) {
    var firstLetter = util.array.trim(token)[0];    
    var doubleQuotationArr = token.filter(function(elem) {
      return [ '"' ].indexOf(elem) > -1;
    });
    
    return (firstLetter === '"') && (doubleQuotationArr.length === 1);
  },
  _isRunningInsideObject: function() {
    return (this.currentDepth - this.globalDepth) >= 1;
  },
  _isRunningOutsideObject: function() {
    return this.currentDepth === this.globalDepth;
  },

  /* parser의 분석 기준 체크 */

  _isStarting: function(thisLetter, token) {
    var isOutsideObject = this._isRunningOutsideObject();    
    var isStartBracket = this.target.checkStartBracket(thisLetter);
    var isEmptyToken = (token.join('').trim().length === 0);
    
    return isOutsideObject && isStartBracket && isEmptyToken; 
  },
  _isCollectingToken: function(thisLetter, token) {
    var isInsideObject = this._isRunningInsideObject();
    var isInsideString = this._isRunningInsideString(token);
    var isNotCuttingComma = !letter.isCuttingComma(thisLetter, token);
    var isNotEndBracket = !this.target.checkEndBracket(thisLetter);

    return isInsideObject || isInsideString || (isNotCuttingComma && isNotEndBracket);
  },
  _isAnalyzingToken: function(thisLetter, token) {
    var isCuttingComma = letter.isCuttingComma(thisLetter, token);
    var isEndBracket = this.target.checkEndBracket(thisLetter);

    return isCuttingComma || isEndBracket;
  },
  _isCheckingKey: function(thisLetter, token) {
    var isColon = letter.checkLetter('COLON', thisLetter);    
    var keyType = typeChecker.getType(token);

    return isColon && (keyType === 'string');
  },

  /* JSON 처리 */

  _parseJSON: function(JSONStr, startIndex) {
    var JSONStrArr = util.type.isString(JSONStr) ? JSONStr.split('') : JSONStr;
    var tempToken = [];

    var targetIsObject = (this.target.type === 'object');
    var haveCuttingColon = false;
    var isNotSupportType = false;
    var startIndex = startIndex || 0;
    var pauseIndex = 0;

    // JSON String Array 탐색 시작 처리
    if (startIndex > 0) {
      JSONStrArr.splice(0, startIndex);
      JSONStrArr = util.array.trim(JSONStrArr);

      // 값 ,
      if (letter.checkLetter('COMMA', JSONStrArr[0])) {
        printer.addOutput(printer.output.pop(), JSONStrArr.shift());
      }

      // '      ' ]
      if (letter.checkLetter('RIGHT_BRACKET', JSONStrArr[0])) {
        printer.addTab(this.globalDepth - 1);
        printer.addOutput(JSONStrArr.shift());
      }

    } else {
      if (!this._isStarting(JSONStrArr[0], tempToken)) {
        message.showNotSupportType();
        return;
      }

      this._moveDepth('globalDepth', 'up');
      this._moveDepth('currentDepth', 'up');
      printer.addOutput(JSONStrArr.shift());
    }
    
    startIndex++;

    // JSON String Array 탐색 반복처리, 예외가 생기면 반복문 종료
    JSONStrArr.some(function(thisLetter, thisIndex) {
      var tempTokenType = null;
      var isLastLetter = (JSONStrArr.length - 1) === thisIndex;      

      // 현재 depth 크기만큼 탭 추가
      if (printer.tempOutputLine.length === 0) {
        printer.addTab(this.globalDepth);
      }

      // depth 변경
      if (!this._isRunningInsideString(tempToken) && letter.checkLetter('LEFT_BRACKET', thisLetter)) {
        this._moveDepth('currentDepth', 'up');
      }

      // 오브젝트의 key 처리
      if (targetIsObject && this._isCheckingKey(thisLetter, tempToken)) {
        if (tempToken.length === 0) {
          isNotSupportType = true;
          return true;          
        }

        printer.addTempOutputLine(tempToken, ' ' , thisLetter, ' ');
        tempToken = [];
        haveCuttingColon = true;
        return false;
      }

      // token 배열에 한 글자씩 모으기
      if (!isLastLetter && this._isCollectingToken(thisLetter, tempToken)) {
        tempToken.push(thisLetter);

        if (!this._isRunningInsideString(tempToken) && letter.checkLetter('RIGHT_BRACKET', thisLetter)) {
          this._moveDepth('currentDepth', 'down');
        }
        return false;
      }

      // 모아둔 token 배열의 타입을 분석 및 처리
      if (this._isAnalyzingToken(thisLetter, tempToken)) {
        tempTokenType = typeChecker.getType(util.array.trim(tempToken));

        if (validateBeforeAnalyzing()) return true;
        
        // token type으로 count 처리
        if (this.globalDepth === 1) { this._addCount(tempTokenType); }

        // token 이 객체일 경우 중첩구조 처리를 위해 반복문 멈춤
        if ([ 'object', 'array' ].indexOf(tempTokenType) > - 1) {
          pauseIndex = thisIndex;
          return true;
        }

        // print 조각모으기 완료.
        if (letter.isCuttingComma(thisLetter, tempToken)) {
          //  값 ,
          printer.addOutput(tempToken, thisLetter);
        }

        if (letter.checkLetter('RIGHT_BRACKET', thisLetter)) {
          //    값
          //  }
          printer.addOutput(tempToken);
          printer.addTab(this.globalDepth - 1);
          printer.addOutput(thisLetter);
        }

        tempToken = [];
      }

      function validateBeforeAnalyzing() {
        if (tempToken.length === 0) {
          isNotSupportType = true;
          return true;
        }

        if (targetIsObject) {
          if (haveCuttingColon) {
            haveCuttingColon = false;
          } else {
            isNotSupportType = true;
            return true;
          }
        }

        if (tempTokenType === null) {
          isNotSupportType = true;
          return true;
        }

        return false;
      }
    }.bind(this));

    // 지원하지 않는 형식을 만났을 때
    if (isNotSupportType) {
      message.showNotSupportType();
      return;
    }

    // pauseIndex가 있을 경우, 탐색한 객체안에 중첩이 있다는 뜻이므로 관련정보를 stack에 저장
    if (pauseIndex > 0) {
      this.returnStack[this.globalDepth - 1] = {
        JSONStr: JSONStr,
        startIndex: startIndex + pauseIndex
      };

      this.run(tempToken.join(''));
      return;
    }

    // 재귀일 경우 depth 조절
    if (this.returnStack.length > 0) {
      var returnInfo = this.returnStack.pop();

      this._moveDepth('globalDepth', 'down');
      this._moveDepth('currentDepth', 'down');
      this.run(returnInfo.JSONStr, returnInfo.startIndex);

      return;      
    }

    // 출력
    message.showCountMessage(this.counter, this.target.type);
    printer.showOutput();
  }
};


/**
 * Printer
 */

var printer = {
  init: function() {
    this._resetTempOutputLine();
    this._resetOutput();
  },
  addTab: function(number) {
    var tab = this._makeTab(number);
    this.tempOutputLine.push(tab);
  },
  addTempOutputLine: function() {
    // 모든 arguments 를 1뎁스의 배열로 합침.
    Array.from(arguments, function(thisArg) {
      this.tempOutputLine = [].concat(this.tempOutputLine, thisArg);
    }.bind(this));
  },
  addOutput: function() {
    arguments.length && this.addTempOutputLine.apply(this, arguments);

    this.output.push(this.tempOutputLine.join(''));
    this._resetTempOutputLine();
  },
  showOutput: function() {
    this.output.forEach(function(elem) {
      console.log(elem);
    });
    console.log('\n \n');
  },

  _makeTab: function(number) {
    if (number <= 0) { return ''; }
    for (var i = 1, tabStr = '\t'; i < number; i++) { tabStr += '\t'; }

    return tabStr;
  },
  _resetTempOutputLine: function() {
    this.tempOutputLine = [];
  },
  _resetOutput: function() {
    this.output = [];
  }
};


/**
 * Message
 */

var message = {
  showNotSupportType: function() {
    console.log('지원하지 않는 형식을 포함하고 있습니다. \n');    
  },
  showCountMessage: function(counter, type) {
    var type = { array: '배열', object: '객체' }[type];
    var messages = [];
    
    if (counter.total === 0) {
      console.log(`총 0개의 ${type} 데이터가 있습니다. \n`);
      return;
    }

    if (counter.string > 0) { messages.push(`문자열 ${counter.string}개`); }
    if (counter.number > 0) { messages.push(`숫자 ${counter.number}개`); }
    if (counter.boolean > 0) { messages.push(`불린 ${counter.boolean}개`); }
    if (counter.object > 0) { messages.push(`객체 ${counter.object}개`); }
    if (counter.array > 0) { messages.push(`배열 ${counter.array}개`); }

    messages.join(' , ');
    console.log(`총 ${counter.total}개의 ${type} 데이터 중에 ${messages} 가 포함되어 있습니다. \n`);
  }
};


/**
 * 실행영역
 */

var app = {
  run: function() {
    r.question('분석할 JSON 데이터를 입력하세요. \n', function(JSONStr) {
      this._init();
      parser.run(JSONStr);

      this.run();
    }.bind(this));
  },
  
  _init: function() {
    printer.init();    
    parser.init();
  }
};

app.run();



