import _ from 'lodash';
import './styles.css';
import myIcon from './project-icon.png';

function component() {
  const element = document.createElement('div');
  element.innerHTML = _.join(['hello', 'webpack'], ' ');
  element.classList.add('text');
  const icon = new Image();
  icon.src = myIcon;
  element.appendChild(icon);
  return element;
}

document.body.appendChild(component());