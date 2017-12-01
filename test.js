
/**
 * function call 과 this
 */

const obj = (function(value) {
  function print() {
    console.log('#', this); // window
    // console.log(this.value); // undefined
    console.log('##', this.value); // crong
  }
  return {
    value: value,
    print: function() {
      // XXX 여기서 call 사용해보기
      // print(); 
      print.call(this);
    }
  }
})('crong');
obj.print();


/**
 * call 과 prototype
 */

var util = function() {
  this.getName = function() {
    return this.name;
  };
  this.setName = function(name) {
    this.name = name;
  };
};

function Name(name) {
  this.name = name;
}

util.call(Name.prototype);

var my = new Name('crong');
my.getName();
