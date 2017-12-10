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
 *    {사용자 입력값 처리기}실행
 * 
 * 타입분석기 (결과값 : 문자열, 숫자, 불리언)
 *    "가 있는지 체크 ==> 문자열
 *    isNaN 체크 ==> 숫자
 *    true, false ===> 불리언  
 * 
 * 사용자 입력값 처리기
 *    [ 가 나오면 시작
 *    , 또는 ] 가 아닌게 나오면 {temp모으기}
 *    , 또는 ] 가 나오면 {타입분석기(temp)}
 * 
 */


/**
 * 타입분석기 (결과값 : 문자열, 숫자, 불리언)
 */

var typeChecker = function(tempPiece) {
  if (tempPiece[0] === ' ') { tempPiece.shift(); }
  var joinedTemp = tempPiece.join('').trim();

  // 문자
  if (tempPiece[0] === '"') { return 'string'; }
  
  // 숫자
  if (isNaN(joinedTemp) === false) { return 'number'; }
  
  // 불린
  if (joinedTemp === "true" || joinedTemp === "false") { return 'boolean'; }

  return;
};


/**
 *  사용자 입력값 처리기
 */

var parser = {
  isCuttingComma: function(str, tempPiece) {
    if (tempPiece[0] === '"') {
      return (str === ',') && (tempPiece[tempPiece.length - 1] === '"');
    } else {
      return str === ',';
    }
  },
  isDoubleQuotation: function(str) { return str === '"'; },
  isLeftSquareBracket: function(str) { return str === '['; },
  isRightSquareBracket: function(str) { return str === ']'; },
  pieceWillBeCollected: function(str) { 
    return this.isLeftSquareBracket(str); 
  },
  pieceIsBeingCollected: function(str, tempPiece) { 
    return !this.isCuttingComma(str, tempPiece) && !this.isRightSquareBracket(str);    
  },
  pieceWasCollected: function(str, tempPiece) { 
    return this.isCuttingComma(str, tempPiece) || this.isRightSquareBracket(str);
  },
  countByType: function(jsonStr) {
    var tempPiece = [];
    var result = { total: 0, string: 0, number: 0, boolean: 0 };
    
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
        var pieceType = typeChecker(tempPiece);
        result.total++;        
        result[pieceType]++;
        tempPiece = [];
      }
    }

    this.showCountMessage(result);
    return result;
  },
  showCountMessage: function(result) {
    console.log(`총 ${result.total}개의 데이터 중에 문자열 ${result.string}개, 숫자 ${result.number}개, 부울 ${result.boolean}개가 포함되어 있습니다. \n`);
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

