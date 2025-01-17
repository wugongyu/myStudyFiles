// import _ from 'lodash';
import './styles.css';
import myIcon from './project-icon.png';
import toml from './data.toml';
import webpackNumbers from 'webpack-numbers';

console.log(toml.title);
console.log(webpackNumbers.numToWord(1));

// function component() {
//   const element = document.createElement('div');
//   element.innerHTML = _.join(['hello', 'webpack'], ' ');
//   element.classList.add('text');
//   const icon = new Image();
//   icon.src = myIcon;
//   element.appendChild(icon);
//   return element;
// }

// document.body.appendChild(component());

async function getComponent() {
  const element = document.createElement('div');
  // 动态引入lodash, lodash 打包时会分离到一个单独的 bundle
  const { default: _ } = await import('lodash');
  element.innerHTML = _.join(['hello', 'webpack'], ' ');
  element.classList.add('text');
  const icon = new Image();
  icon.src = myIcon;
  element.appendChild(icon);
  return element;
}

getComponent().then((comp) => {
  document.body.appendChild(comp);
})