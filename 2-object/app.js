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
 * 타입분석기 (결과값 : 문자열, 숫자, 불리언)
 */

var typeChecker = function(tempPiece) {
  if (tempPiece[0] === ' ') { tempPiece.shift(); }
  var joinedTemp = tempPiece.join('').trim();

  // 문자
  if ((tempPiece[0] === '"') && (tempPiece[tempPiece.length - 1] === '"')) { return 'string'; }
  
  // 숫자
  // TODO ( isNaN("") => isNaN은 형변환을 해서 정확하지 않음. 
  // toString.call(joinTemp)하려고 했으나, join할 때 숫자가 스트링으로 리턴되는 문제가...
  // 일단은 빈 스트링이 오지 않도록 전단계에서 처리함.
  if (isNaN(joinedTemp) === false) { return 'number'; }

  // 불린
  if (joinedTemp === "true" || joinedTemp === "false") { return 'boolean'; }

  // 오브젝트
  if ((tempPiece[0] === '{') && (tempPiece[tempPiece.length - 1] === '}')) { return 'object'; }

  return;
};


/**
 *  Character
 */

var character = {
  isCuttingComma: function(str, tempPiece) {
    str = str.trim();
    tempPiece = trimArray(tempPiece);

    // 스트링("") 내부에 있는지 체크
    if (tempPiece[0] === '"') {
      return (str === ',') && (tempPiece[tempPiece.length - 1] === '"');
    } 

    // 객체({}) 내부에 있는지 체크
    if (tempPiece[0] === '{') {
      return (str === ',') && (tempPiece[tempPiece.length - 1] === '}');
    }

    return str === ',';
  },
  isDoubleQuotation: function(str) { return str === '"'; },
  isColon: function(str) { return str === ':'; },
  isLeftCurlyBracket: function(str) { return str === '{'; },
  isRightCurlyBracket: function(str) { return str === '}'; },
  isLeftSquareBracket: function(str) { return str === '['; },
  isRightSquareBracket: function(str) { return str === ']'; }
};

function trimArray(arr) {
  if (arr[0] === ' ') { arr.shift(); }
  if (arr[arr.length - 1] === ' ') { arr.pop(); }

  return arr;
}


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

  // piece

  pieceWillBeCollected: function(str) {
    var isStartBracket = this.targetMethod[this.targetType].isStartBracket;
    
    return isStartBracket(str); 
  },
  pieceIsBeingCollected: function(str, tempPiece) {
    var isEndBracket = this.targetMethod[this.targetType].isEndBracket;
    
    return !character.isCuttingComma(str, tempPiece) && !isEndBracket(str);    
  },
  pieceWasCollected: function(str, tempPiece) {
    var isEndBracket = this.targetMethod[this.targetType].isEndBracket;
    
    return character.isCuttingComma(str, tempPiece) || isEndBracket(str);
  },

  // count

  countByType: function(jsonStr) {
    var firstJsonStr = jsonStr[0];

    if (firstJsonStr === '[') { this.countArrayByType(jsonStr); return; }
    if (firstJsonStr === '{') { this.countObjectByType(jsonStr); return; }
  },
  countArrayByType: function(jsonStr) {
    var tempPiece = [];
    var result = { total: 0, string: 0, number: 0, boolean: 0, object: 0 };
    
    this.targetType = 'array';

    for (var i = 0, thisStr; i < jsonStr.length; i++) {
      thisStr = jsonStr[i];

      if (this.pieceWillBeCollected(thisStr)) {
        continue;
      }

      if (this.pieceIsBeingCollected(thisStr, tempPiece)) {
        tempPiece.push(thisStr);
        continue;
      }

      if (this.pieceWasCollected(thisStr, tempPiece)) {
        if (tempPiece.length === 0) { continue; }

        var pieceType;
        tempPiece = trimArray(tempPiece);
        pieceType = typeChecker(tempPiece);

        if (pieceType !== undefined) {
          result.total++;        
          result[pieceType]++;
          tempPiece = [];  
        }
      }
    }

    this.showArrayCountMessage(result);
    
    return result;
  },
  countObjectByType: function(jsonStr) {
    var tempPiece = [];
    var result = { total: 0, string: 0, number: 0, boolean: 0 };
    
    this.targetType = 'object';    

    for (var i = 0, thisStr; i < jsonStr.length; i++) {
      thisStr = jsonStr[i];

      if (character.isColon(thisStr)) {
        tempPiece = []; // key:value중 value값만 저장하기 위해..
        continue;
      }

      if (this.pieceWillBeCollected(thisStr)) {
        continue;
      }

      if (this.pieceIsBeingCollected(thisStr, tempPiece)) {
        tempPiece.push(thisStr);
        continue;
      }

      if (this.pieceWasCollected(thisStr, tempPiece)) {
        if (tempPiece.length === 0) { continue; }
        
        var pieceType;
        tempPiece = trimArray(tempPiece);
        pieceType = typeChecker(tempPiece);

        if (pieceType !== undefined) {
          result.total++;        
          result[pieceType]++;
          tempPiece = [];  
        }
      }
    }

    this.showObjectCountMessage(result);

    return result;
  },

  // message

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

