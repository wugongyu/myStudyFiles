/*函数组合*/ 

function compose() {
  var args = [].slice.call(arguments);
  var startIndex = args.length - 1;
  return function() {
    var i = startIndex;
    var result = args[i].apply(this, arguments);
    while(i--) {
      result = args[i].call(this, result);
    }
    return result;
  }
}

// pointFree
function toUpperCase(x) {
  return x.toUpperCase();
}
function hello(x) {
  return 'HELLO, ' + x;
}

var greet = compose(hello, toUpperCase);
console.log(greet('melody'));
