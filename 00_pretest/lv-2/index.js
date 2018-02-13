/*
  추가사항
  - 야구게임에서는 랜덤숫자에 중복이 없어야 하고, 첫번째 숫자에 0은 올 수 없음
*/


var $form = document.getElementById('userForm');
var $input = document.getElementById('userInput');
var $btn = document.getElementById('btn');

var NUM_LENGTH = 3;
var TARGET_NUM_STR = null;
var USER_NUM_STR = null;


/**
 * Method
 */

var makeRandomNumber = function(length) {
  var numbers = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
  var randomIndex;
  var result = [];

  for (var i = 0; i < length; i++) {
    // numbers배열에서 꺼내올 숫자 위치 랜덤 생성
    if (i === 0) {
      randomIndex = 1 + (Math.floor(Math.random() * 9)); // 첫번째 자리는 0 제외
    } else {
      randomIndex = Math.floor(Math.random() * (10 - i));
    }

    result[i] = numbers[randomIndex]; // 선택된 숫자를 결과배열에 저장
    numbers.splice(randomIndex, 1); // 선택된 숫자를 numbers배열에서 제거
  }

  return result.join('');
}

var userResult = (function() {
  var s = 0;
  var b = 0;

  return {
    STRIKE: function() { return s; },
    BALL: function() { return b; },
    reset: function() {
      s = 0;
      b = 0;
    },
    addStrike: function() {
      s++;
    },
    addBall: function() {
      b++;
    }
  };
})();

var getValidationMsg = function() {
  // 값이 없을 경우
  if (!USER_NUM_STR) { return '값을 입력해 주세요.'; }

  // 숫자가 아닐 경우
  if (isNaN(parseInt(USER_NUM_STR, 10))) { return '숫자만 입력할 수 있습니다.'; }

  // 자릿수가 다를 경우
  if (USER_NUM_STR.length !== NUM_LENGTH) { return NUM_LENGTH + '자리 숫자로 입력해 주세요.'; }

  // 중복된 숫자가 있을 경우
  for (var i = 0, regExp, matchArr; i < USER_NUM_STR.length; i++) {
    regExp = new RegExp(USER_NUM_STR[i], 'gi');
    matchArr = USER_NUM_STR.match(regExp);
    if (matchArr && matchArr.length > 1) { return '중복되지 않는 숫자로 입력해 주세요.'; break; }
  }

  return '';
};

var checkNum = function() {
  for (var i = 0; i < NUM_LENGTH; i++) {
    // 스트라이크
    if (TARGET_NUM_STR[i] === USER_NUM_STR[i]) { userResult.addStrike(); continue; }

    // 볼
    if (TARGET_NUM_STR.indexOf(USER_NUM_STR[i]) !== -1) { userResult.addBall(); }
  }
};

var html = (function() {
  var $wrapper = document.getElementById('log');

  var getHtmlStr = function() {
    var strikeNum = userResult.STRIKE();
    var ballNum = userResult.BALL();
    var template = '';

    switch (strikeNum + ballNum) {
      // 낫싱
      case 0:
        template = '<li class="result">낫싱</li>';
        break;

      // 모두 일치
      case NUM_LENGTH:
        template = '<li class="result">[ ' + $input.value + ' ] ===> ' + strikeNum + ' 스트라이크, ' + ballNum + '볼</li>';
        template += '<li class="complete">' + NUM_LENGTH + '개의 숫자를 모두 맞히셨습니다! 게임 종료</li>';
        break;

      // 부분 일치
      default:
        template = '<li class="result">[ ' + $input.value + ' ] ===> ' + strikeNum + ' 스트라이크, ' + ballNum + '볼</li>';
    }

    return template;
  }

  return {
    reset: function() {
      $wrapper.innerHTML = '';
    },
    insertLog: function() {
      var htmlStr = getHtmlStr();
      var htmlNode;
      var addElem = document.createElement('template');
      addElem.innerHTML = htmlStr;
      var addElemLength = addElem.content.childNodes.length;

      for (var i = 0; i < addElemLength; i++) {
        htmlNode = addElem.content.childNodes[0];
        $wrapper.append(htmlNode);
      }
    }
  };
})();

var runGame = function() {
  /* init */
  userResult.reset();
  USER_NUM_STR = $input.value;

  /* validation */
  var validationMsg;
  validationMsg = getValidationMsg();
  if (validationMsg !== '') {
    alert(validationMsg);
    $input.select();
    return false;
  }

  /* check & result */
  checkNum();
  html.insertLog();
};


/**
 * User Event
 */

$btn.onclick = function() {
  runGame();
};

$form.onsubmit = function(e) {
  e.preventDefault();
  runGame();
};


/**
 * Initialize
 */

function init() {
  html.reset();
  TARGET_NUM_STR = makeRandomNumber(NUM_LENGTH);
  console.log('TARGET_NUM_STR', TARGET_NUM_STR);
}

init();
