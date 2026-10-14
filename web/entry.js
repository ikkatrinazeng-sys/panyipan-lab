const chart = require('../miniprogram/utils/chart.js');
const st = require('../miniprogram/utils/solar-time.js');
const REGIONS = require('../miniprogram/libs/regions.js');
const { LunarYear, Solar } = require('../miniprogram/libs/engine.js');
/** 今天的干支与农历，开屏用 */
function today(d = new Date()) {
  const l = Solar.fromYmdHms(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), 0).getLunar();
  const ec = l.getEightChar();
  return { year: ec.getYear(), month: ec.getMonth(), day: ec.getDay(), lunar: `农历${l.getMonthInChinese()}月${l.getDayInChinese()}`, jieqi: l.getPrevJieQi(true).getName() };
}
function lunarMonths(year) {
  return LunarYear.fromYear(year).getMonths().filter((m) => m.getYear() === year)
    .map((m) => ({ month: Math.abs(m.getMonth()), isLeap: m.getMonth() < 0, days: m.getDayCount() }));
}
const insight = require('../miniprogram/utils/insight.js');
module.exports = { compute: chart.compute, REGIONS, lunarMonths, hourNames: st.HOUR_NAMES, insight, today };
