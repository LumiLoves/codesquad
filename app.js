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
 * Message
 */

var message = {
  template: {
    idTitle: function(itemObj) {
      return itemObj.id + ', ' + itemObj.title;
    },
    titleDuration: function(itemObj) {
      return itemObj.title + ', ' + itemObj.duration.hour + '시간 ' + itemObj.duration.min+ '분';
    }
  },
  printItemsByState: function(state) {
    var result = [];
    var taskArr = task.getData();
    var templateName = {
      todo: 'idTitle',
      doing: 'idTitle',
      done: 'titleDuration'
    }[state];
    var templateFunc = this.template[templateName];

    taskArr.forEach(function(thisObj) {
      if (thisObj.state === state) {
        result.push(templateFunc(thisObj));
      }
    });

    if (result.length) {
      result = result.join(' / ');
      console.log('> ' + result);
    } else {
      console.log('> 아이템이 없습니다.');
    }
  },
  addItem: function(taskItem) {
    console.log('> id: '+ taskItem.id +',  "'+ taskItem.title +'" 항목이 새로 추가됐습니다.');
  },
  countItem: function(taskArr) {
    var result = { todo: 0, doing: 0, done: 0 };

    taskArr.forEach(function(thisObj) {
      if (thisObj.state === 'todo') { result.todo++; }
      if (thisObj.state === 'doing') { result.doing++; }
      if (thisObj.state === 'done') { result.done++; }
    });

    setTimeout(function() {
      console.log('> [현재상태] todo: '+ result.todo +'개, doing: '+ result.doing +'개, done: '+ result.done +'개');      
    }, 3000);
  }
};


/**
 * Task
 */

function TaskItem(title) {
  this.id = task.currentId++; // (수정불가)
  this.title = title; // (수정불가)
  this.state = 'todo';
  this.startTime = null; // timestamp
  this.endTime = null; // timestamp
  this.duration = null; // { hour: 정수, min: 정수 };
}

var task = {
  currentId: 1,
  data: [],
  getData: function() {
    return this.data;
  },  
  findIndex: function(id) {
    var result = this.data.findIndex(function(elem) {
      return elem.id == id;
    });

    return (result !== undefined)? result : false;
  },
  addItem: function(title) {
    var taskArr = this.data;
    var taskItem = new TaskItem(title);

    if (!title) {
      console.log('> 할일 내용을 입력해 주세요.');      
      return false;
    }

    taskArr.push(taskItem);
    message.addItem(taskItem);
    message.countItem(taskArr);
  },
  updateItem: function(id, state) {
    var taskArr = this.data;    
    var index = this.findIndex(id);
    var taskItem = taskArr[index];
    var objFunc = {
      doing: 'makeDoingObj',
      done: 'makeDoneObj'
    }[state];

    if (index === false) { console.log('> 존재하지 않는 아이템입니다.'); return false; }
    if (taskItem.state === state) { console.log('> 이미 '+ state +'상태 입니다.'); return false; }
    if (!objFunc) { console.log('사용할 수 없는 State를 입력하셨습니다.'); return false; }

    this[objFunc](taskItem);
    message.countItem(taskArr);
  },
  makeDoingObj: function(taskItem) {
    taskItem.startTime = time.getNow();
    if (taskItem.state === 'done') {
      taskItem.endTime = null;
      taskItem.duration = null;
    }
    taskItem.state = 'doing';
  },
  makeDoneObj: function(taskItem) {
    if (taskItem.state === 'todo') {
      taskItem.startTime = null;
      taskItem.endTime = null;
      taskItem.duration = { hour: 0, min: 0 };
    } else {
      taskItem.endTime = time.getNow();
      taskItem.duration = time.getDuration(taskItem.startTime, taskItem.endTime);
    }
    taskItem.state = 'done';
  }
};


/**
 * 실행영역
 */

// readline 셋팅
r.setPrompt('');
r.prompt();

// dummy data 생성용 test코드
task.addItem('title111');
task.addItem('title222');
task.addItem('title3333');
task.addItem('title4444');

r.on('line', function(cmd) {
  /*
   * 명령어 종류
   * - add$자바스크립트 공부하기
   * - update$3$done
   * - show$doing 
   */
  var cmdArr = cmd.split('$');
  var cmd = cmdArr[0];
  var cmdCallback = {    
    add: function(cmdArr) {
      var title = cmdArr[1];

      task.addItem(title);
    },
    update: function(cmdArr) {
      var id = cmdArr[1];
      var state = cmdArr[2];

      task.updateItem(id, state);
    },
    show: function(cmdArr) {
      var state = cmdArr[1];

      message.printItemsByState(state);
    },
    exit: function() {
      r.close();    
    }
  };

  function runCmd(cmd) {
    var callback = cmdCallback[cmd];
    (callback)? callback(cmdArr) : console.log(line);
  }

  runCmd(cmd);
  r.prompt();
});

r.on('close', function() {
  process.exit();
});
