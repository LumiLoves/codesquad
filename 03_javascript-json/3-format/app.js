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
  trimArray: function(arr) {
    if (arr[0] === ' ') { arr.shift(); }
    if (arr[arr.length - 1] === ' ') { arr.pop(); }
  
    return arr;
  }
};


/**
 *  Character
 */

var character = {
  isComma: function(str) { return str === ','; },
  isDoubleQuotation: function(str) { return str === '"'; },
  isColon: function(str) { return str === ':'; },
  isLeftCurlyBracket: function(str) { return str === '{'; },
  isRightCurlyBracket: function(str) { return str === '}'; },
  isLeftSquareBracket: function(str) { return str === '['; },
  isRightSquareBracket: function(str) { return str === ']'; },
  
  isCuttingComma: function(str, tempPiece) {
    str = str.trim();
    tempPiece = util.trimArray(tempPiece);

    var firstPiece = tempPiece[0];
    var lastPiece = tempPiece[tempPiece.length - 1];

    // 스트링("") 내부에 있는 Comma인지 체크 (ex : ",")
    if (this.isDoubleQuotation(firstPiece)) {
      return this.isComma(str) && this.isDoubleQuotation(lastPiece);
    }

    // 객체({}) 내부에 있는 Comma인지 체크 (ex : [ {,,,} , { } ])
    if (this.isLeftCurlyBracket(firstPiece)) {
      return this.isComma(str) && this.isRightCurlyBracket(lastPiece);
    }

    return this.isComma(str);
  }
};


/**
 * 타입분석기 (결과값 : 문자열, 숫자, 불리언)
 */

var typeChecker = {
  isString: function(tempPiece) {
    var hasFirstDoubleQuotation = character.isDoubleQuotation(tempPiece[0]);
    var hasLastDoubleQuotation = character.isDoubleQuotation(tempPiece[tempPiece.length - 1]);
    var doubleQuotationArr = tempPiece.filter(function(elem) {
      return character.isDoubleQuotation(elem);      
    });

    return hasFirstDoubleQuotation && hasLastDoubleQuotation && (doubleQuotationArr.length === 2);
  },
  isNumber: function(joinedTemp) {
    return !isNaN(joinedTemp);
  },
  isBoolean: function(joinedTemp) {
    return [ 'true', 'false' ].indexOf(joinedTemp) > -1;
  },
  isObject: function(tempPiece) {
    var hasFirstCurlyBracket = character.isLeftCurlyBracket(tempPiece[0]);
    var hasLastCurlyBracket = character.isRightCurlyBracket(tempPiece[tempPiece.length - 1]);
    var curlyBracketArr = tempPiece.filter(function(elem) {
      return [ '{', '}' ].indexOf(elem) > -1;
    });

    return hasFirstCurlyBracket && hasLastCurlyBracket && (curlyBracketArr.length === 2);
  },

  getType: function(tempPiece) {
    var joinedTemp = '';

    tempPiece = util.trimArray(tempPiece);  
    joinedTemp = tempPiece.join('').trim();

    if (joinedTemp === '') { return 'nothing'; }
    if (this.isString(tempPiece)) { return 'string'; }
    if (this.isNumber(joinedTemp)) { return 'number'; }
    if (this.isBoolean(joinedTemp)) { return 'boolean'; }
    if (this.isObject(tempPiece)) { return 'object'; }

    return 'nothing';
  }
};


/**
 *  사용자 입력값 처리기
 */

var parser = {

  // target

  targetType: null,
  targetMethod: {
    array: {
      isStartBracket: character.isLeftSquareBracket,
      isEndBracket: character.isRightSquareBracket
    },
    object: {
      isStartBracket: character.isLeftCurlyBracket,
      isEndBracket: character.isRightCurlyBracket
    }
  },

  // piece collecting status

  willCollectPiece: function(str) {
    var isStartBracket = this.targetMethod[this.targetType].isStartBracket(str);
    
    return isStartBracket; 
  },
  isCollectingPiece: function(str, tempPiece) {
    var isNotCuttingComma = !character.isCuttingComma(str, tempPiece);
    var isNotEndBracket = !this.targetMethod[this.targetType].isEndBracket(str);

    return isNotCuttingComma && isNotEndBracket;
  },
  collectedPiece: function(str, tempPiece) {
    var isCuttingComma = character.isCuttingComma(str, tempPiece);
    var isEndBracket = this.targetMethod[this.targetType].isEndBracket(str);

    return isCuttingComma || isEndBracket;
  },
  stopToCollectPiece: function(str, tempPiece) {
    var isColon = character.isColon(str);
    var doubleQuotationArr = tempPiece.filter(function(elem) {
      return elem === '"';
    });

    return isColon && (doubleQuotationArr.length === 2);
  },

  // count

  countByType: function(jsonStr) {
    jsonStr.trim();

    var firstJsonStr = jsonStr[0];
    var lastJsonStr = jsonStr[jsonStr.length - 1];

    if (character.isLeftSquareBracket(firstJsonStr) && character.isRightSquareBracket(lastJsonStr)) { 
      this.countArrayByType(jsonStr);
      return;
    }
    if (character.isLeftCurlyBracket(firstJsonStr) && character.isRightCurlyBracket(lastJsonStr)) { 
      this.countObjectByType(jsonStr);
      return;
    }

    message.showNotSupportType();    
  },
  countArrayByType: function(jsonStr) {
    var tempPiece = [];
    var hasException = false;
    var result = { total: 0, string: 0, number: 0, boolean: 0, object: 0 };
    
    this.targetType = 'array';

    hasException = jsonStr.split('').some(function(thisStr) {
      var pieceType = null;
      
      if (this.willCollectPiece(thisStr)) { return; }

      if (this.isCollectingPiece(thisStr, tempPiece)) {
        tempPiece.push(thisStr);

        return;
      }

      if (this.collectedPiece(thisStr, tempPiece)) {
        if (tempPiece.length === 0) { return; }

        pieceType = typeChecker.getType(util.trimArray(tempPiece));
        if (pieceType === 'nothing') {
          message.showNotSupportType();
          
          return pieceType === 'nothing';
        }
        
        result.total++;        
        result[pieceType]++;
        tempPiece = [];
      }
    }.bind(this));

    (hasException === false) && message.showArrayCountMessage(result);
    
    return result;
  },
  countObjectByType: function(jsonStr) {
    var tempPiece = [];
    var hasException = false;
    var hasCuttingColon = false;
    var result = { total: 0, string: 0, number: 0, boolean: 0 };
    
    this.targetType = 'object';    

    hasException = jsonStr.split('').some(function(thisStr) {
      var pieceType = null;

      if (this.willCollectPiece(thisStr)) { return; }

      if (this.stopToCollectPiece(thisStr, tempPiece)) {
        if (tempPiece.length === 0) { return; }

        tempPiece = [];
        hasCuttingColon = true;
        
        return;
      }

      if (this.isCollectingPiece(thisStr, tempPiece)) {
        tempPiece.push(thisStr);

        return;
      }

      if (this.collectedPiece(thisStr, tempPiece)) {
        if (tempPiece.length === 0) { return; }

        pieceType = typeChecker.getType(util.trimArray(tempPiece));
        if (pieceType === 'nothing') {
          message.showNotSupportType(); 

          return pieceType === 'nothing'; // some 조건에 만족하여 반복문 수행을 멈춤
        }

        if (hasCuttingColon !== true) {
          message.showNotSupportType();       

          return pieceType === 'nothing';
        }
        
        hasCuttingColon = false;
        result.total++;        
        result[pieceType]++;
        tempPiece = [];
      }
    }.bind(this));

    (hasException === false) && message.showObjectCountMessage(result);

    return result;
  }
};


/**
 * Message
 */

var message = {
  showNotSupportType: function() {
    console.log('지원하지 않는 형식을 포함하고 있습니다. \n');    
  },
  showArrayCountMessage: function(result) {
    console.log(`총 ${result.total}개의 배열 데이터 중에 객체 ${result.object}개, 문자열 ${result.string}개, 숫자 ${result.number}개, 부울 ${result.boolean}개가 포함되어 있습니다. \n`);
  },
  showObjectCountMessage: function(result) {
    console.log(`총 ${result.total}개의 객체 데이터 중에 문자열 ${result.string}개, 숫자 ${result.number}개, 부울 ${result.boolean}개가 포함되어 있습니다. \n`);
  }
};


/**
 * 실행영역
 */

function runCmd() {
  r.question('분석할 JSON 데이터를 입력하세요. \n', function(answer) {
    parser.countByType(answer);

    runCmd();
  });
}

runCmd();



