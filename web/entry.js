const chart = require('../miniprogram/utils/chart.js');
const st = require('../miniprogram/utils/solar-time.js');
const REGIONS = require('../miniprogram/libs/regions.js');
const { LunarYear } = require('../miniprogram/libs/engine.js');
function lunarMonths(year) {
  return LunarYear.fromYear(year).getMonths().filter((m) => m.getYear() === year)
    .map((m) => ({ month: Math.abs(m.getMonth()), isLeap: m.getMonth() < 0, days: m.getDayCount() }));
}
const insight = require('../miniprogram/utils/insight.js');
module.exports = { compute: chart.compute, REGIONS, lunarMonths, hourNames: st.HOUR_NAMES, insight };
