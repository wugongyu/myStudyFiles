const twoNum = (nums, target) => {
  const maps = {};
  for(let i = 0, len = nums.length; i < len; i++) {
      let diff = target - nums[i];
      if (maps[diff] > -1) {
          return [maps[diff], i];
      }
      maps[nums[i]] = i;
  }
  return [];
}