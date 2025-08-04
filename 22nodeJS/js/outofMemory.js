var showMemory = function() {
  var mem = process.memoryUsage();
  var format = function(bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  }
  console.log("PROCESS: heapTotal " + format(mem.heapTotal)+
    " heapUsed " + format(mem.heapUsed) +
    " rss " + format(mem.rss)
  );
  console.log('---------------------------------------------');
}

// 该方法不停地分配内存但不释放内存
var useMemory = function() {
  // var size = 20 * 1024 * 1024; // 每次构造20MB
  var size = 200 * 1024 * 1024; // 200MB
  // var arr = new Array(size);
  var arr = new Buffer(size);
  for (var index = 0; index < size; index++) {
    arr[index] = 0;
  }
  return arr;
}

var total = [];
for (var j = 0; j < 15; j++) {
  showMemory();
  total.push(useMemory())
}
showMemory();