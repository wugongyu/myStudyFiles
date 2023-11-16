type EventBusNameType = 'error' | 'default';
interface EventBusConfigType {
  eventBus: {
    default: Array<Function>,
    error: Array<Function>,
  };
}

interface StrategyPatternHashMapType {
  id?: string;
  isOpen?: string;
  [key: string]: any;
}

// 策略模式
class StrategyPattern {
  strategyPatternHashMap: Map<string, Function>; // 策略数据

  config: EventBusConfigType;

  constructor(config: EventBusConfigType) {
    this.config = { ...config };
    this.strategyPatternHashMap = new Map();
  }

  /**
   * 将策略key 对象进行属性排序，并转换成json字符串返回
   * @param strategyPatternHashKey StrategyPatternHashMapType
   * */
  changeObjectToStringiFyKey(strategyPatternHashKey: StrategyPatternHashMapType) {
    const hashKeyMap = new Map();
    const sortedHashKey = Object.keys(strategyPatternHashKey).sort(); // 属性排序
    sortedHashKey.forEach((k) => {
      hashKeyMap.set(k, strategyPatternHashKey[k]);
    });
    const stringifyKey = JSON.stringify(Object.fromEntries(hashKeyMap));
    return stringifyKey;
  }

  /**
   * 增加（设置）策略
   * @param strategyPatternHashKeys 策略key值数组，为Object对象数组，类型为StrategyPatternHashMapType[]
   * @param strategyPatternHashValue 策略值，为Function对象
   * */
  addStrategyPattern(
    strategyPatternHashKeys: StrategyPatternHashMapType[],
    strategyPatternHashValue: Function,
  ) {
    for (let i = 0; i < strategyPatternHashKeys.length; i++) {
      const stringifyKey = this.changeObjectToStringiFyKey(strategyPatternHashKeys[i]);
      this.strategyPatternHashMap.set(stringifyKey, strategyPatternHashValue);
    }
  }

  /**
   * 获取策略，根据策略key获取对应的策略值，并触发调用策略值函数，
   * 此外需对异常情况进行自定义函数处理，并且要有默认兜底函数。
   * */
  getStrategyPattern(strategyPatternHashKey: StrategyPatternHashMapType, that?: any) {
    const stringifyKey = this.changeObjectToStringiFyKey(strategyPatternHashKey);
    if (!this.strategyPatternHashMap.get(stringifyKey)) {
      // 触发默认兜底函数
      this.emit('default', '触发默认兜底函数');
      return;
    }
    const strategyPatternHashValueFun = this.strategyPatternHashMap.get(stringifyKey);
    
    try {
      if(!strategyPatternHashValueFun) return;
      if (that) {
        strategyPatternHashValueFun.bind(that);
      } else {
        strategyPatternHashValueFun();
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * 发布订阅者模式实现自定义的默认/异常情况的处理函数
   * */
  emit(name: EventBusNameType, data: any) {
    if (this.config.eventBus && this.config.eventBus[name]) {
      this.config.eventBus[name].forEach((bus: Function) => {
        bus(data);
      });
    } else {
      throw new Error('没有这个事件！');
    }
  }
}

export default {
  StrategyPattern,
};
