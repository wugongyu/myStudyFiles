import _ from 'lodash';
import numRef from './ref.json';

export function numToWord(num){
  return _.reduce(numRef, (prev, cur) => {
    return cur.num === num ? cur.word : prev;
  }, '')
}

export function wordToNum(word) {
  return _.reduce(numRef, (prev, cur) => {
    return cur.word === word && word.toLowerCase() ? cur.num : prev
  }, -1)
}

export default {
  numToWord,
  wordToNum,
}