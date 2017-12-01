
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

