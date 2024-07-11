/**
 * 实现一个 Dialog 类，Dialog可以创建 dialog 对话框，对话框支持可拖拽
   由鼠标事件（MouseEvent）可以发现：
   其中包含了许多的坐标，且每个坐标的含义都不一样。下面我们来挨个介绍常用的坐标，以及它们的含义。
      一、clientX、clientY
      点击位置距离当前body可视区域的x，y坐标
      二、pageX、pageY
      对于整个页面来说，包括了被卷去的body部分的长度

      三、screenX、screenY
      点击位置距离当前电脑屏幕的x，y坐标

      四、offsetX、offsetY
      相对于带有定位的父盒子的x，y坐标

      五、x、y
      和screenX、screenY一样

      【注意点】
      使用事件代理挂在document下，这样子防止拖得快的时候滑手
      如果需要动画打开关闭，则不可以马上删除元素了，应该要切换样式来实现或者延迟一阵删元素。antd的modal是默认切样式，加上destroyonclose会等动画播完再删元素
      使用的时候不要反复new，一个实例应该要做到无数次复用
 * */ 
class Dialog {
  constructor(text) {
    this.lastX = 0;
    this.lastY = 0;
    this.x; // 点击拖拽时当前鼠标x坐标
    this.y; // 点击拖拽时当前鼠标x坐标
    this.text = text || '';
    this.isMoving = false;
    this.dialog;
  }
  open() {
    // 创建蒙层容器
    const model = document.createElement('div');
    model.id = 'model';
    model.style = `
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0,0,0,.3);
    display: flex;
    justify-content: center;
    align-items: center;`;
    // 点击蒙层实现关闭弹窗
    model.addEventListener('click', this.close.bind(this));
    document.body.appendChild(model);
    // 创建对话弹窗
    this.dialog = document.createElement('div');
    this.dialog.style = `
      padding: 20px;
      background-color: white;`;
    this.dialog.innerText = this.text;
    // 绑定弹窗拖拽事件
    // 阻止冒泡
    this.dialog.addEventListener('click', function(e){ e.stopPropagation() })
    this.dialog.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    model.appendChild(this.dialog);
  }
  close() {
    this.dialog.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.body.removeChild(document.querySelector('#model'));
  }
  handleMouseDown(e) {
    // console.log(e, 'handleMouseDown');
    this.isMoving = true;
    this.x = e.clientX;
    this.y = e.clientY;
  }
  handleMouseMove(e) {
    // console.log(e, 'handleMouseMove');
    if(this.isMoving) {
       const translateX = e.clientX - this.x + this.lastX;
       const translateY = e.clientY - this.y + this.lastY;
       this.dialog.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }
  }
  handleMouseUp(e) {
    // console.log(e,'handleMouseUp');
    this.lastX = e.clientX - this.x + this.lastX;
    this.lastY = e.clientY - this.y + this.lastY;
    this.isMoving = false;
  }
}


class DialogTypeTwo{
  constructor(opts = {}) {
    this.onCancel = opts.onCancel || (() => {});
    this.onOk = opts.onOk || (() =>{});
    this.dialogTitle = opts.title || 'this is the default title';
    this.dialogContent = opts.content || 'this is the default content';
    this.dialogFooter = opts.footer || [{ title: 'cancel' }, { title: 'ok' }];
    this.dialog;
  }
  // 添加弹窗蒙层
  createMask() {

  }
  // 初始化弹窗
  initDialog() {

  }
  // 给弹窗添加拖拽事件
  dragEvent() {
    
  }
}