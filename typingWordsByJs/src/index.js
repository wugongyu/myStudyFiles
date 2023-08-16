// class EasyTyper{
//   constructor(obj,input,fn,hooks){
//     this.props={
//       output:'',
//       type:'rollback',
//       isEnd:false,
//       speed:80,
//       backSpeed:40,
//       sleep:6000,
//       singleBack:false
//     };
//     if(this.checkKeyIsNull(obj)){
//       return this.errorTip(`EsayTyped.js:配置对象中有一个字段是undefined或null，请仔细检查对象是否完整！！！`)
//     };
//     if(this.checkFieldIsError(obj)){return};
//     this.obj=obj;
//     this.input=input||'抱歉，没有内容输入';
//     this.fn=typeof fn==='function'?fn:function(){};
//     this.hooks=typeof hooks==='function'?hooks:function(){};
//     this.timer=null;
//     this.close=this.close;
//     this.sleep=this.sleep;
//     this.typeAction={
//       'rollback':this.typedBack.bind(this),
//       'normal':this.fn,
//       'custom':this.fn
//     };
//     this._init();
//   }
//   _init(){
//     this.play();
//   }
//   play(){
//     let i=0,stop=false;
//     this.timer=setInterval(()=>{
//       if(i===this.input.length){i=0;stop=true;this.closeTimer();};
//       if(this.obj.isEnd)return this.closeTimer();
//       if(stop)return this.nextTick();
//       this.obj.output=this.input.slice(0,i+1);
//       this.hooks(this.input.slice(0,i+1),this);i++;
//     },this.obj.speed);
//   }
//   typedBack(){
//     let input=this.obj.output;
//     let i=input.length,stop=false;
//     this.timer=setInterval(()=>{
//       if(i===-1){
//         this.obj.output='';
//         this.hooks('',this);
//         i=0;
//         stop=true;
//         this.closeTimer();
//       }
//       if(this.obj.isEnd){
//         this.closeTimer();
//         return this.obj.singleBack=false;
//       }
//       if(stop){
//         this.obj.singleBack=false;
//         return this.fn(this);
//       }
//       this.obj.output=input.slice(0,i+1);
//       this.hooks(input.slice(0,i+1),this);
//       i--;
//     },this.obj.backSpeed);
//   }
//   getOutputType(){
//     return this.typeAction[this.obj.type](this);
//   }
//   closeTimer(){
//     clearInterval(this.timer);
//     this.timer=null;
//   }
//   async nextTick(){
//     await this.sleep(this.obj.sleep);
//     return this.obj.singleBack?this.typedBack():this.getOutputType();
//   }
//   checkKeyIsNull(obj){
//     return Object.keys(this.props).some(key=>{return obj[key]===undefined||obj[key]===null;})
//   }
//   checkFieldIsError(obj){
//     const{output,type,isEnd,speed,backSpeed,sleep,singleBack}=obj
//     if(typeof output!=='string'){
//       this.errorTip(`output 必须为 string 类型`);
//       return true
//     };
//     if(typeof type!=='string'){
//       this.errorTip(`type 必须为 string 类型`);
//       return true
//     };
//     if(typeof isEnd!=='boolean'){
//       this.errorTip(`isEnd 必须为 boolean 类型`);
//       return true
//     };
//     if(typeof speed!=='number'){
//       this.errorTip(`speed 必须为 number 类型`);
//       return true
//     };
//     if(typeof backSpeed!=='number'){
//       this.errorTip(`backSpeed 必须为 number 类型`);
//       return true
//     };
//     if(typeof sleep!=='number'){
//       this.errorTip(`sleep 必须为 number 类型`);
//       return true
//     };
//     if(typeof singleBack!=='boolean'){
//       this.errorTip(`singleBack 必须为 boolean 类型`);
//       return true
//     };
//   }
//   sleep(ms){
//     return new Promise(resolve=>setTimeout(resolve,ms));
//   }
//   close(){
//     return this.obj.isEnd=true;
//   }
//   errorTip(message){
//     return console.error(message);
//   }
// }

// 引入
import EasyTyper from 'easy-typer-js';
import './index.css';
const obj = {
  output: '', // 输出内容  使用MVVM框架时可以直接使用
  type: 'normal',
  isEnd: false,
  speed: 80,
  backSpeed: 40,
  sleep: 3000,
  singleBack: true,
  sentencePause: false
}
const typing = new EasyTyper(obj, [`黎明前的黑暗是最深不见底的黑暗！`,`天下哪有真情在，只要够萌咱都爱！`, 'live for nothing, or die for something!'], (instance)=>{
   // 回调函数，easyTyper生命周期结束后执行
   console.log('结束了，我的使命！')
}, (output, instance)=>{
  // 钩子函数，每一帧的数据获取和实例EasyTyper的获取
  document.getElementById('output').innerHTML = `${output}<span class="easy-typed-cursor">|</span>`
})
// 12秒后停止
let timer = setTimeout(() => {
clearTimeout(timer)
timer = null
typing.close()
// alert('stop!')
}, 120000)