/**
 * 개선하고 싶은 사항
 *
 * - 수정불가항목에 대한 처리
 * - 완전한 클래스타입
 * - 아이디로 판별하지 않고 객체로 판별
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
 * Task
 */

var task = (function() {
  var id = 1;
  var taskArr = [];

  function TaskItem(title) {
    this.id = id++; // 수정불가
    this.title = title; // 수정불가
    this.state = STATE.TODO();
    this.startTime = null; // timestamp
    this.endTime = null; // timestamp
    this.duration = null; // { hour: 정수, min: 정수 };
  }

  // > 현재상태 :  todo:1개, doing:1개, done:3개  //변경된 모든 상태가 노출되지만 3초뒤에 결과가 나와야 한다.
  var msgItemCount = function() {
    var result = { todo: 0, doing: 0, done: 0 };

    for (var index = 0, item; index < taskArr.length; index++) {
      item = taskArr[index];

      if (item.state === STATE.TODO()) { result.todo++; }
      if (item.state === STATE.DOING()) { result.doing++; }
      if (item.state === STATE.DONE()) { result.done++; }

      setTimeout(function() {
        console.info('[현재상태] todo: '+ result.todo +'개, doing: '+ result.doing +'개, done: '+ result.done +'개');
      }, 3000);
    }
  };

  // 진행중 (todo, doing)
  // > "1, 그래픽스공부", "4, 블로그쓰기"  //id값과 함께 task제목이 출력된다.
  // 완료 (done)
  // > 'iOS공부하기, 3시간', '자바스크립트공부하기, 9시간', '미팅 1시간'.  //이렇게 완료할때까지의 누적 시간을 표현한다.
  var msgByState = function(state) {
    var result = [];
    var msg = {
      todo: '',
      doing: '',
      done: ''
    };

    for (var index = 0; index < taskArr.length; index++) {
      item = taskArr[index];

      if (item.state === STATE.TODO()) {
        result.push(item.id + ', ' + item.title);
      }

      if (item.state === STATE.DONE()) {
        result.push(item.title + ', ' + item.duration.hour + '시간 ' + item.duration.min+ '분');
      }

      result = result.join(' / ');
      console.info(result);
    }
  };

  // > id: 5,  "자바스크립트 공부하기" 항목이 새로 추가됐습니다.  //추가된 결과 메시지를 이렇게 출력
  var msgByAdd = function(item) {
    console.info('id: '+ item.id +',  "'+ item.title +'" 항목이 새로 추가됐습니다.');
  };




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
    msgByAdd(item);
    msgItemCount(item);
  };

  // todo, doing ==> done
  var updateItemToDone = function(id) {
    var index = findItemIndex(id);
    var item = taskArr[index];

    // validation
    if (!index) { console.info('존재하지 않는 아이템입니다.'); return false; }
    if (item.state === STATE.DONE()) { console.info('이미 done 상태 입니다.'); return false; }

    // update
    item.state = STATE.DONE();
    item.endTime = getCurrentTimestamp();
    if (item.state === STATE.TODO()) { item.startTime = item.endTime; }
    item.duration = getDurationHourMin();

    // console
    msgItemCount();
  };

  // todo, done ==> doing
  var updateItemToDoing = function(id) {
    var index = findItemIndex(id);
    var item = taskArr[index];

    // validation
    if (!index) { console.info('존재하지 않는 아이템입니다.'); return false; }
    if (item.state === STATE.DOING()) { console.info('이미 doing 상태 입니다.'); return false; }

    // update
    item.state = STATE.DOING();
    item.startTime = getCurrentTimestamp();
    item.endTime = null;
    item.duration = null;

    // console
    msgItemCount();
  };

  return {
    add: addItem,
    updateToDoing: updateItemToDoing,
    updateToDone: updateItemToDone,
    show: msgByState
  };
})();


/**
 * Console (입력처리, 출력메시지)
 */



/**
 * User Event
 */

task.add('가계부 정리하기');
task.add('개발하기');

task.show(STATE.TODO());
task.show(STATE.DOING());
task.show(STATE.DONE());

// task.update(3, TASK.TODO());
task.updateToDoing(1);
task.updateToDone(1);
