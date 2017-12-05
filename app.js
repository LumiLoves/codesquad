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
  template: {
    idTitle: function(itemObj) {
      return itemObj.id + ', ' + itemObj.title;
    },
    titleWithDuration: function(itemObj) {
      return itemObj.title + ', ' + itemObj.duration.hour + '시간 ' + itemObj.duration.min+ '분';
    }
  },
  runByState: function(taskArr, state, templateFunc) {
    var result = [];

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
  todo: function(taskArr) {
    this.runByState(taskArr, STATE.TODO, this.template.idTitle);
  },
  doing: function(taskArr) {
    this.runByState(taskArr, STATE.DOING, this.template.idTitle);
  },
  done: function(taskArr) {
    this.runByState(taskArr, STATE.DONE, this.template.titleWithDuration);    
  },
  add: function(taskItem) {
    console.log('> id: '+ taskItem.id +',  "'+ taskItem.title +'" 항목이 새로 추가됐습니다.');
  },
  itemCount: function(taskArr) {
    var result = { todo: 0, doing: 0, done: 0 };

    taskArr.forEach(function(thisObj) {
      if (thisObj.state === STATE.TODO) { result.todo++; }
      if (thisObj.state === STATE.DOING) { result.doing++; }
      if (thisObj.state === STATE.DONE) { result.done++; }
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
  this.state = STATE.TODO;
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
  add: function(title) {
    var taskArr = this.data;
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
    var taskArr = this.data;    
    var index = this.findIndex(id);
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
    var taskArr = this.data;    
    var index = this.findIndex(id);
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
 * runCmd
 */

var runCmd = {
  add: function(cmdArr) {
    var title = cmdArr[1];
    task.add(title);
  },
  update: function(cmdArr) {
    var id = cmdArr[1];
    var state = cmdArr[2];

    var methodMap = {
      doing: task.updateToDoing,
      done: task.updateToDone
    }[state].call(task, id);
  },
  show: function(cmdArr) {
    var state = cmdArr[1];
    var tasks = task.getData();
    
    msg[state](tasks);
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
      runCmd.add(cmdArr);
      break;

    // > "update$3$done"
    case 'update':
      runCmd.update(cmdArr);    
      break;

    // > "show$doing"
    case 'show':
      runCmd.show(cmdArr);  
      break;

    case 'exit':
      runCmd.exit();
      break;

    default:
      console.log(line);
  }

  r.prompt();
});

r.on('close', function() {
  process.exit();
});
