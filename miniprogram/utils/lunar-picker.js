// 农历日期三列选择器的数据：年 / 月（含闰月）/ 日

const { LunarYear } = require('../libs/engine.js');

const START_YEAR = 1901;
const END_YEAR = 2099;
const MONTH_CN = ['', '正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
const DAY_CN = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

const YEARS = [];
for (let y = START_YEAR; y <= END_YEAR; y++) YEARS.push(y);

/** 某农历年的月份列表：[{ month, isLeap, days, label }] */
function monthsOf(year) {
  return LunarYear.fromYear(year).getMonths()
    .filter((m) => m.getYear() === year)
    .map((m) => {
      const month = Math.abs(m.getMonth());
      const isLeap = m.getMonth() < 0;
      return { month, isLeap, days: m.getDayCount(), label: (isLeap ? '闰' : '') + MONTH_CN[month] };
    });
}

/** 由选中下标生成 multiSelector 的 range 和当前值 */
function build(yearIdx, monthIdx, dayIdx) {
  const year = YEARS[yearIdx];
  const months = monthsOf(year);
  const mi = Math.min(monthIdx, months.length - 1);
  const days = months[mi].days;
  const di = Math.min(dayIdx, days - 1);
  return {
    range: [
      YEARS.map((y) => y + '年'),
      months.map((m) => m.label),
      DAY_CN.slice(1, days + 1),
    ],
    index: [yearIdx, mi, di],
    value: { year, month: months[mi].month, isLeap: months[mi].isLeap, day: di + 1 },
    label: `${year}年 ${months[mi].label}${DAY_CN[di + 1]}`,
  };
}

/** 默认停在 1995 年正月初一附近，方便大多数用户少滑 */
function initial() {
  return build(1995 - START_YEAR, 0, 0);
}

module.exports = { build, initial };
