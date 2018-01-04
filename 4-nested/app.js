var readline = require('readline');
var r = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


/**
 * 설계
 * 
 * 
 * 사용자 입력값 이벤트 발생
 *    {파서할당}실행
 * 
 * 파서 할당
 *    [ 가 나오면 {배열 파서}
 *    { 가 나오면 {오브젝트 파서}
 * 
 * 문자체크
 *    컴마, 더블쿼테이션, 콜론, 브라켓 등을 체크
 * 
 * 타입분석기 (결과값 : 문자열, 숫자, 불리언)
 *    "가 있는지 체크 ==> 문자열
 *    isNaN 체크 ==> 숫자
 *    true, false ===> 불리언
 *
 * 배열 파서
 *    [ 가 나오면 시작
 *    , 또는 ] 가 아닌게 나오면 {temp모으기}
 *    , 또는 ] 가 나오면 그동안 모아놓은 temp배열을 분석기로 보내서 결과값을 얻음. {타입분석기(temp)}
 * 
 * 오브젝트 파서
 *    { 가 나오면 시작
 *    , 또는 } 가 아닌게 나오면 {temp모으기}
 *    : 가 나오면 temp리셋 (key:value중 value값만 저장하기 위해..)
 *    , 또는 } 가 나오면 그동안 모아놓은 temp배열을 분석기로 보내서 결과값을 얻음. {타입분석기(temp)}
 * 
 */


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
      return toString.call(data) === '[object Array]';
    }
  }
};


/**
 *  Letter 
 */

var letter = {
  isComma: function(thisLetter) { return thisLetter === ','; },
  isDoubleQuotation: function(thisLetter) { return thisLetter === '"'; },
  isColon: function(thisLetter) { return thisLetter === ':'; },

  isLeftCurlyBracket: function(thisLetter) { return thisLetter === '{'; },
  isRightCurlyBracket: function(thisLetter) { return thisLetter === '}'; },
  isLeftSquareBracket: function(thisLetter) { return thisLetter === '['; },
  isRightSquareBracket: function(thisLetter) { return thisLetter === ']'; },
  
  isBracket: function(thisLetter) { return [ '{', '}', '[', ']' ].indexOf(thisLetter) > -1; },
  isLeftBracket: function(thisLetter) { return [ '{', '[' ].indexOf(thisLetter) > -1; },
  isRightBracket: function(thisLetter) { return [ '}', ']' ].indexOf(thisLetter) > -1; },
  
  isArrayBrackets: function(leftBracket, rightBracket) {
    return this.isLeftSquareBracket(leftBracket) && this.isRightSquareBracket(rightBracket);
  },
  isObjectBrackets: function(leftBracket, rightBracket) {
    return this.isLeftCurlyBracket(leftBracket) && this.isRightCurlyBracket(rightBracket);    
  },

  isCuttingComma: function(thisLetter, token) {
    thisLetter = thisLetter.trim();
    token = util.array.trim(token);

    var firstLetter = token[0];
    var lastLetter = token[token.length - 1];

    // 스트링("") 내부에 있는 Comma인지 체크 (ex : ",")
    if (this.isDoubleQuotation(firstLetter)) {
      return this.isComma(thisLetter) && this.isDoubleQuotation(lastLetter);
    }

    // 객체({}) 내부에 있는 Comma인지 체크 (ex : {,,,} , { } )
    if (this.isLeftCurlyBracket(firstLetter)) {
      return this.isComma(thisLetter) && this.isRightCurlyBracket(lastLetter);
    }

    // 배열([]) 내부에 있는 Comma인지 체크 (ex : [,,,] , [ ] )
    if (this.isLeftSquareBracket(firstLetter)) {
      return this.isComma(thisLetter) && this.isRightSquareBracket(lastLetter);
    }

    return this.isComma(thisLetter);
  }
};


/**
 * 타입 분석기 (결과값 : 문자열, 숫자, 불린, 객체, 배열)
 */

var typeChecker = {
  getType: function(token) {
    var joinedTemp = '';

    token = util.array.trim(token);  
    joinedTemp = token.join('').trim();

    if (joinedTemp === '') { return 'nothing'; }
    if (this._isString(token)) { return 'string'; }
    if (this._isNumber(joinedTemp)) { return 'number'; }
    if (this._isBoolean(joinedTemp)) { return 'boolean'; }
    if (this._isObject(token)) { return 'object'; }
    if (this._isArray(token)) { return 'array'; }

    return 'nothing';
  },

  _isString: function(token) {
    var hasFirstDoubleQuotation = letter.isDoubleQuotation(token[0]);
    var hasLastDoubleQuotation = letter.isDoubleQuotation(token[token.length - 1]);
    var doubleQuotationArr = token.filter(function(elem) {
      return letter.isDoubleQuotation(elem);      
    });

    return hasFirstDoubleQuotation && hasLastDoubleQuotation && (doubleQuotationArr.length === 2);
  },
  _isNumber: function(joinedTemp) {
    return !isNaN(joinedTemp);
  },
  _isBoolean: function(joinedTemp) {
    return [ 'true', 'false' ].indexOf(joinedTemp) > -1;
  },
  _isObject: function(token) {
    var hasFirstCurlyBracket = letter.isLeftCurlyBracket(token[0]);
    var hasLastCurlyBracket = letter.isRightCurlyBracket(token[token.length - 1]);
    var curlyBracketArr = token.filter(function(elem) {
      return [ '{', '}' ].indexOf(elem) > -1;
    });

    return hasFirstCurlyBracket && hasLastCurlyBracket && (curlyBracketArr.length % 2 === 0);
  },
  _isArray: function(token) {
    var hasFirstSquareBracket = letter.isLeftSquareBracket(token[0]);
    var hasLastSquareBracket = letter.isRightSquareBracket(token[token.length - 1]);
    var squareBracketArr = token.filter(function(elem) {
      return [ '[', ']' ].indexOf(elem) > -1;
    });

    return hasFirstSquareBracket && hasLastSquareBracket && (squareBracketArr.length % 2 === 0);    
  }
};


/**
 *  Parser
 */

var parser = {
  init: function() {
    this._initProcessData();
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

  /* parser data 조작 */
  _initProcessData: function() {
    this.returnStack = [];  // [ { JSONStr: '...', startIndex: 10 }, { ... } ]
    this.globalDepth = 0;   // 시작 브라켓과 엔드 브라켓만 옮길 수 있음
    this.currentDepth = 0;  // parse 하는 중간에 옮길 수 있음
    this.counter = { total: 0, string: 0, number: 0, boolean: 0, object: 0, array: 0 };
  },
  _initTargetData: function(targetType) {
    var bracketMethod = {
      array: {
        isStartBracket: letter.isLeftSquareBracket,
        isEndBracket: letter.isRightSquareBracket
      },
      object: {
        isStartBracket: letter.isLeftCurlyBracket,
        isEndBracket: letter.isRightCurlyBracket
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

  /* parser 가 돌고 있는 상태 조회. */

  _isInsideObject: function() {
    return (this.currentDepth - this.globalDepth) >= 1;
  },
  _isOutsideObject: function() {
    return this.currentDepth === this.globalDepth;
  },
  _isInsideString: function(token) {
    var firstLetter = util.array.trim(token)[0];    
    var doubleQuotationArr = token.filter(function(elem) {
      return [ '"' ].indexOf(elem) > -1;
    });
    
    return (firstLetter === '"') && (doubleQuotationArr.length === 1);
  },

  /* parsing 상태 체크 */

  _isStarting: function(thisLetter, token) {
    var isOutsideObject = this._isOutsideObject();    
    var isStartBracket = this.target.checkStartBracket(thisLetter);
    var isEmptyToken = (token.join('').trim().length === 0);
    
    return isOutsideObject && isStartBracket && isEmptyToken; 
  },
  _isCollectingToken: function(thisLetter, token) {
    var isInsideObject = this._isInsideObject();
    var isInsideString = this._isInsideString(token);
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
    var isColon = letter.isColon(thisLetter);
    var keyType = typeChecker.getType(token);

    return isColon && (keyType === 'string');
  },

  /* parsing 처리 */

  _parseJSON: function(JSONStr, startIndex) {
    var targetIsObject = (this.target.type === 'object');    
    var tempToken = [];
    var JSONStrArr = util.type.isString(JSONStr) ? JSONStr.split('') : JSONStr;

    var isNotSupportType = false;
    var hasCuttingColon = false;
    var startIndex = startIndex || 0;
    var pauseIndex = 0;

    // 배열 시작 처리
    if (startIndex > 0) {
      JSONStrArr.splice(0, startIndex);
      JSONStrArr = util.array.trim(JSONStrArr);

      // 값 ,
      if (letter.isComma(JSONStrArr[0])) {
        printer.addOutput(printer.output.pop(), JSONStrArr.shift());
      }

      // '      ' ]
      if (letter.isRightBracket(JSONStrArr[0])) {
        printer.addTab(this.globalDepth - 1);
        printer.addOutput(JSONStrArr.shift());
      }

    } else {
      if (! this._isStarting(JSONStrArr[0], tempToken)) {
        message.showNotSupportType();

        return;
      }

      this._moveDepth('globalDepth', 'up');
      this._moveDepth('currentDepth', 'up');
      printer.addOutput(JSONStrArr.shift());
      
    }
    
    startIndex++;

    // 배열 Scan
    JSONStrArr.some(function(thisLetter, thisIndex) {
      var tempTokenType = null;
      var isLastLetter = (JSONStrArr.length - 1) === thisIndex;      

      // 탭 추가
      if (printer.tempOutputLine.length === 0) {
        printer.addTab(this.globalDepth);
      }

      // depth 변경
      if (!this._isInsideString(tempToken) && letter.isLeftBracket(thisLetter)) {
        this._moveDepth('currentDepth', 'up');
      }

      if (targetIsObject && this._isCheckingKey(thisLetter, tempToken)) {
        if (tempToken.length === 0) {
          isNotSupportType = true;

          return true;          
        }

        printer.addTempOutputLine(tempToken, ' ' , thisLetter, ' ');
        tempToken = [];
        hasCuttingColon = true;

        return false;
      }

      // token 모으기
      if (!isLastLetter && this._isCollectingToken(thisLetter, tempToken)) {
        tempToken.push(thisLetter);

        if (!this._isInsideString(tempToken) && letter.isRightBracket(thisLetter)) {
          this._moveDepth('currentDepth', 'down');
        }

        return false;
      }

      // token 분석 및 처리
      if (this._isAnalyzingToken(thisLetter, tempToken)) {
        tempTokenType = typeChecker.getType(util.array.trim(tempToken));

        if (tempToken.length === 0) {
          isNotSupportType = true;
          return true;
        }

        if (targetIsObject) {
          if (hasCuttingColon === true) {
            hasCuttingColon = false;
          } else {
            isNotSupportType = true;
            return true;
          }
        }

        if (tempTokenType === 'nothing') {
          isNotSupportType = true;

          return true;
        }

        // token type 으로 count 처리
        if (this.globalDepth === 1) { this._addCount(tempTokenType); }

        // token 이 객체일 경우 멈춤
        if ([ 'object', 'array' ].indexOf(tempTokenType) > - 1) {
          pauseIndex = thisIndex;

          return true;
        }

        // print 조각모으기 완료.
        if (letter.isCuttingComma(thisLetter, tempToken)) {
          //  값 ,
          printer.addOutput(tempToken, thisLetter);
        }

        if (letter.isRightBracket(thisLetter)) {
          //    값
          //  }
          printer.addOutput(tempToken);
          
          printer.addTab(this.globalDepth - 1);
          printer.addOutput(thisLetter);
        }

        tempToken = [];
      }

    }.bind(this));

    // 지원하지 않는 형식을 만났을 때.
    if (isNotSupportType === true) {
      message.showNotSupportType();

      return;
    }

    // pauseIndex가 있을 경우, 탐색한 객체안에 중첩이 있다는 뜻이므로 저장.
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
    this._initData();
  },
  addTab: function(number) {
    var tab = this._makeTab(number);
    this.tempOutputLine.push(tab);
  },
  addTempOutputLine: function() {
    // 모든 arguments 를 하나의 배열로 합쳐줌.
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

  _initData: function() {
    this._resetTempOutputLine();
    this._resetOutput();
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



