var readline = require('readline');
var r = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


/**
 * Time
 */

var time = {
  getNow: function() {
    return new Date().getTime();
  },
  getDuration: function(startTime, endTime) {
    var gap = endTime - startTime;
    // var secGap = gxap / 1000;
    var minGap = gap / 1000 / 60;
    var hourGap = gap / 1000 / 60 / 60;
  
    return {
      hour: Math.floor(hourGap),
      min: Math.floor(minGap % 60)
    };
  }
};


/**
 * STATE
 */

var STATE = {
  TODO: 'TODO',
  DOING: 'DOING',
  DONE: 'DONE'
};


/**
 * Message
 */

var msg = {
  itemCount: function(taskArr) {
    var result = { todo: 0, doing: 0, done: 0 };

    for (var i = 0, thisObj; i < taskArr.length; i++) {
      thisObj = taskArr[i];
      if (thisObj.state === STATE.TODO) { result.todo++; }
      if (thisObj.state === STATE.DOING) { result.doing++; }
      if (thisObj.state === STATE.DONE) { result.done++; }
    }

    setTimeout(function() {
      console.log('> [현재상태] todo: '+ result.todo +'개, doing: '+ result.doing +'개, done: '+ result.done +'개');      
    }, 3000);
  },
  state: function(taskArr, state) {
    var result = [];
    var pushTodoItems = function() {
      for (var i = 0, thisObj; i < taskArr.length; i++) {
        thisObj = taskArr[i];
        if (thisObj.state === STATE.TODO) {
          result.push(thisObj.id + ', ' + thisObj.title);
        }
      }
    };
    var pushDoingItems = function() {
      for (var i = 0, thisObj; i < taskArr.length; i++) {
        thisObj = taskArr[i];
        if (thisObj.state === STATE.DOING) {
          result.push(thisObj.id + ', ' + thisObj.title);
        }
      }
    };
    var pushDoneItems = function() {
      for (var i = 0, thisObj; i < taskArr.length; i++) {
        thisObj = taskArr[i];
        if (thisObj.state === STATE.DONE) {
          result.push(thisObj.title + ', ' + thisObj.duration.hour + '시간 ' + thisObj.duration.min+ '분');
        }
      }
    };

    switch (state) {
      case STATE.TODO:
        pushTodoItems();
        break;

      case STATE.DOING:
        pushDoingItems();      
        break;

      case STATE.DONE:
        pushDoneItems();
        break;
    }

    if (result.length) {
      result = result.join(' / ');
      console.log('> ' + result);
    } else {
      console.log('> 아이템이 없습니다.');
    }
  },
  add: function(taskItem) {
    console.log('> id: '+ taskItem.id +',  "'+ taskItem.title +'" 항목이 새로 추가됐습니다.');
  }
};


/**
 * Task
 */

function TaskItem(title) {
  this.id = task.currentId++; // (수정불가)
  this.title = title; // (수정불가)
  this.state = STATE.TODO;
  this.startTime = null; // timestamp
  this.endTime = null; // timestamp
  this.duration = null; // { hour: 정수, min: 정수 };
}

var task = {
  currentId: 1,
  data: [],
  getData: function() {
    var that = this;
    return that.data;
  },  
  findIndex: function(id) {
    var that = this;
    var taskArr = that.data;
    for (var index = 0; index < taskArr.length; index++) {
      if (taskArr[index].id == id) { return index; }
    }
    return false;
  },
  add: function(title) {
    var that = this;    
    var taskArr = that.data;
    var taskItem = new TaskItem(title);

    if (!title) {
      console.log('> 할일 내용을 입력해 주세요.');      
      return false;
    }

    taskArr.push(taskItem);
    msg.add(taskItem);
    msg.itemCount(taskArr);
  },
  updateToDoing: function(id) {
    var that = this;    
    var taskArr = that.data;    
    var index = that.findIndex(id);
    var taskItem = taskArr[index];

    // validation
    if (index === false) { console.log('> 존재하지 않는 아이템입니다.'); return false; }
    if (taskItem.state === STATE.DOING) { console.log('> 이미 doing 상태 입니다.'); return false; }

    // update
    taskItem.startTime = time.getNow();
    if (taskItem.state === STATE.DONE) {
      taskItem.endTime = null;
      taskItem.duration = null;
    }
    taskItem.state = STATE.DOING;

    msg.itemCount(taskArr);
  },
  updateToDone: function(id) {
    var that = this;    
    var taskArr = that.data;    
    var index = that.findIndex(id);
    var taskItem = taskArr[index];

    // validation
    if (index === false) { console.log('> 존재하지 않는 아이템입니다.'); return false; }
    if (taskItem.state === STATE.DONE) { console.log('> 이미 done 상태 입니다.'); return false; }

    // update
    if (taskItem.state === STATE.TODO) {
      taskItem.startTime = null;
      taskItem.endTime = null;
      taskItem.duration = { hour: 0, min: 0 };
    } else {
      taskItem.endTime = time.getNow();
      taskItem.duration = time.getDuration(taskItem.startTime, taskItem.endTime);
    }
    taskItem.state = STATE.DONE;

    msg.itemCount(taskArr);
  }
};


/**
 * consoleOutput (입력처리, 출력메시지)
 */

var consoleOutput = {
  add: function(cmdArr) {
    var title = cmdArr[1];
    task.add(title);
  },
  update: function(cmdArr) {
    var id = cmdArr[1];
    var state = cmdArr[2];

    if (state === 'doing') { task.updateToDoing(id); }
    if (state === 'done') { task.updateToDone(id); }
  },
  show: function(cmdArr) {
    var state = cmdArr[1];
    
    if (state === 'todo') { msg.state(task.getData(), STATE.TODO); }
    if (state === 'doing') { msg.state(task.getData(), STATE.DOING); }
    if (state === 'done') { msg.state(task.getData(), STATE.DONE); }
  },
  exit: function() {
    r.close();    
  }
};


/**
 * 실행영역
 */

// readline 셋팅
r.setPrompt('');
r.prompt();

// dummy data 생성용 test코드
task.add('title111');
task.add('title222');
task.add('title3333');
task.add('title4444');

r.on('line', function(cmd) {
  var cmdArr = cmd.split('$');
  var cmd = cmdArr[0];

  switch (cmd) {
    // > "add$자바스크립트 공부하기"
    case 'add':
      consoleOutput.add(cmdArr);
      break;

    // > "update$3$done"
    case 'update':
      consoleOutput.update(cmdArr);    
      break;

    // > "show$doing"
    case 'show':
      consoleOutput.show(cmdArr);  
      break;

    case 'exit':
      consoleOutput.exit();
      break;

    default:
      console.log(line);
  }

  r.prompt();
});

r.on('close', function() {
  process.exit();
});
