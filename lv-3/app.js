
/**
 * 개선하고 싶은 사항
 *
 * - 수정불가항목에 대한 처리 (id, title)
 * - 클래스타입 구조
 * - 아이디로 판별하지 않고 객체로 판별
 * - taskArr를 외부로 노출시키는 메소드를 없애고 싶음
 *
 * 버그
 * - 업데이트 후 3초 기다리는 거 잘 안됨.
 */


/**
 * Util
 */

var getCurrentTimestamp = function() {
  return new Date().getTime();
};

var getDurationHourMin = function(startTime, endTime) {
  var gap = endTime - startTime;
  // var secGap = gap / 1000;
  var minGap = gap / 1000 / 60;
  var hourGap = gap / 1000 / 60 / 60;

  return {
    hour: Math.floor(hourGap),
    min: Math.floor(minGap % 60)
  };
};


/**
 * STATE
 */

var STATE = (function() {
  var todo = 'TODO';
  var doing = 'DOING';
  var done = 'DONE';

  return {
    TODO: function() { return todo; },
    DOING: function() { return doing; },
    DONE: function() { return done; }
  };
})();


/**
 * Message
 */

var msg = (function() {

  // 상태별아이템갯수    > 현재상태 :  todo:1개, doing:1개, done:3개
  var showItemCount = function(taskArr) {
    var result = { todo: 0, doing: 0, done: 0 };

    for (var i = 0, item; i < taskArr.length; i++) {
      item = taskArr[i];
      if (item.state === STATE.TODO()) { result.todo++; }
      if (item.state === STATE.DOING()) { result.doing++; }
      if (item.state === STATE.DONE()) { result.done++; }
    }

    // setTimeout(function() {
    // }, 3000);
    console.log('> [현재상태] todo: '+ result.todo +'개, doing: '+ result.doing +'개, done: '+ result.done +'개');
  };

  // 진행중 (todo, doing) > "1, 그래픽스공부", "4, 블로그쓰기"
  // 완료 (done)         > 'iOS공부하기, 3시간', '자바스크립트공부하기, 9시간', '미팅 1시간'
  var showByState = function(taskArr, state) {
    var result = [];

    switch (state) {
      case STATE.TODO():
        for (var i = 0, item; i < taskArr.length; i++) {
          item = taskArr[i];

          if (item.state === STATE.TODO()) {
            result.push(item.id + ', ' + item.title);
          }
        }
        break;

      case STATE.DOING():
        for (var i = 0, item; i < taskArr.length; i++) {
          item = taskArr[i];

          if (item.state === STATE.DOING()) {
            result.push(item.id + ', ' + item.title);
          }
        }
        break;


      case STATE.DONE():
        for (var i = 0, item; i < taskArr.length; i++) {
          item = taskArr[i];

          if (item.state === STATE.DONE()) {
            result.push('> ' + item.title + ', ' + item.duration.hour + '시간 ' + item.duration.min+ '분');
          }
        }
        break;
    }

    result = result.join(' / ');
    console.info(result);
  };

  // 아이템추가안내   > id: 5,  "자바스크립트 공부하기" 항목이 새로 추가됐습니다.
  var showByAdd = function(item) {
    console.log('> id: '+ item.id +',  "'+ item.title +'" 항목이 새로 추가됐습니다.');
  };

  return {
    itemCount: showItemCount,
    byState: showByState,
    byAdd: showByAdd
  };
})();


/**
 * Task
 */

var task = (function() {
  var id = 1;
  var taskArr = [];

  function TaskItem(title) {
    this.id = id++; // (수정불가)
    this.title = title; // (수정불가)
    this.state = STATE.TODO();
    this.startTime = null; // timestamp
    this.endTime = null; // timestamp
    this.duration = null; // { hour: 정수, min: 정수 };
  }

  var findItemIndex = function(id) {
    for (var index = 0; index < taskArr.length; index++) {
      if (taskArr[index].id === id) { return index; }
    }

    return false;
  };

  var addItem = function(title) {
    var item = new TaskItem(title);
    taskArr.push(item);

    // console
    msg.byAdd(item);
    msg.itemCount(taskArr);
  };

  // todo, doing ==> done
  var updateItemToDone = function(id) {
    var index = findItemIndex(id);
    var item = taskArr[index];

    // validation
    if (!index) { console.log('> 존재하지 않는 아이템입니다.'); return false; }
    if (item.state === STATE.DONE()) { console.log('> 이미 done 상태 입니다.'); return false; }

    // update
    item.state = STATE.DONE();
    item.endTime = getCurrentTimestamp();
    if (item.state === STATE.TODO()) { item.startTime = item.endTime; }
    item.duration = getDurationHourMin();

    // console
    msg.itemCount(taskArr);
  };

  // todo, done ==> doing
  var updateItemToDoing = function(id) {
    var index = findItemIndex(id);
    var item = taskArr[index];

    // validation
    if (!index) { console.log('> 존재하지 않는 아이템입니다.'); return false; }
    if (item.state === STATE.DOING()) { console.log('> 이미 doing 상태 입니다.'); return false; }

    // update
    item.state = STATE.DOING();
    item.startTime = getCurrentTimestamp();
    item.endTime = null;
    item.duration = null;

    // console
    msg.itemCount(taskArr);
  };

  return {
    getArr: function() { return taskArr },
    add: addItem,
    updateToDoing: updateItemToDoing,
    updateToDone: updateItemToDone
  };
})();


/**
 * Console (입력처리, 출력메시지)
 */

var readline = require('readline');
var r = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

r.setPrompt('> ');
r.prompt();

// test용
task.add('title111');
task.add('title222');
task.add('title3333');
task.add('title4444');

r.on('line', function(line) {
  var lineArr = line.split('$');
  var command = lineArr[0];

  switch (command) {
    // > "add$자바스크립트 공부하기"
    case 'add':
      var title = lineArr[1];
      task.add(title);
      break;

    // > "update$3$done"
    case 'update':
      var id = lineArr[1];
      var state = lineArr[2];

      if (state === 'doing') { task.updateToDoing(id); }
      if (state === 'done') { task.updateToDone(id); }
      break;

    // > "show$doing"
    case 'show':
      var state = lineArr[1];

      if (state === 'todo') { msg.byState(task.getArr(), STATE.TODO()); }
      if (state === 'doing') { msg.byState(task.getArr(), STATE.DOING()); }
      if (state === 'done') { msg.byState(task.getArr(), STATE.DONE()); }
      break;

    case 'exit':
      r.close();
      break;

    default:
      console.log(line);
  }

  r.prompt();
});

r.on('close', function() {
  process.exit();
});
