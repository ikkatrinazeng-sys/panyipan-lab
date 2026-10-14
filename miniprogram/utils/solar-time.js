// 真太阳时校正：与 skills/mingli-master/scripts/calculate_chart.py 同一套算法
// 经度时差 = (出生地经度 − 120) × 4 分钟；均时差为近似公式，范围约 ±16 分钟

const { CITY, PROVINCE } = require('../libs/cities.js');

const STANDARD_MERIDIAN = 120;

function stripSuffix(name) {
  return (name || '').replace(/(特别行政区|维吾尔自治区|壮族自治区|回族自治区|自治区|省|市|地区|自治州|盟)$/, '');
}

/** 由省市区选择器的结果查经度。返回 { longitude, source }，source 说明精度。 */
function lookupLongitude(region) {
  const [province, city, district] = region || [];
  const candidates = [district, city].filter(Boolean);
  for (const name of candidates) {
    const key = stripSuffix(name);
    if (CITY[key] !== undefined) return { longitude: CITY[key], source: name };
  }
  // 直辖市的"市"一级是"市辖区"之类，直接用省级
  const pkey = stripSuffix(province);
  if (CITY[pkey] !== undefined) return { longitude: CITY[pkey], source: province };
  if (PROVINCE[pkey] !== undefined) return { longitude: PROVINCE[pkey], source: `${province}（按省会）` };
  return null;
}

function dayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

function equationOfTime(d) {
  const b = (2 * Math.PI * (dayOfYear(d) - 81)) / 364;
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

/** 钟点 → 时辰索引。0=早子(00-01) 1=丑 … 11=亥 12=晚子(23-24)，与 iztro 一致 */
function hourIndex(hh, mm) {
  const total = hh * 60 + mm;
  if (total >= 23 * 60) return 12;
  if (total < 60) return 0;
  return Math.floor((total - 60) / 120) + 1;
}

const HOUR_NAMES = ['早子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时', '晚子时'];

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

/**
 * 对钟表时间做真太阳时校正。
 * @param {Date} clock 北京时间钟表时间
 * @param {number} longitude 东经度数
 */
function correct(clock, longitude, useEot = true) {
  const deltaLon = (longitude - STANDARD_MERIDIAN) * 4;
  const deltaEot = useEot ? equationOfTime(clock) : 0;
  const corrected = new Date(clock.getTime() + (deltaLon + deltaEot) * 60000);
  const naive = hourIndex(clock.getHours(), clock.getMinutes());
  const corr = hourIndex(corrected.getHours(), corrected.getMinutes());
  return {
    corrected,
    detail: {
      longitude: Math.round(longitude * 100) / 100,
      longitudeDeltaMin: Math.round(deltaLon * 10) / 10,
      eotMin: Math.round(deltaEot * 10) / 10,
      clockTime: `${pad(clock.getHours())}:${pad(clock.getMinutes())}`,
      trueSolarTime: `${corrected.getFullYear()}-${pad(corrected.getMonth() + 1)}-${pad(corrected.getDate())} ${pad(corrected.getHours())}:${pad(corrected.getMinutes())}`,
      naiveHour: HOUR_NAMES[naive],
      correctedHour: HOUR_NAMES[corr],
      crossedBoundary: naive !== corr,
      // 离时辰边界不足 10 分钟时提醒：出生时间稍有误差就会换时辰
      nearBoundary: minutesToBoundary(corrected) < 10,
    },
  };
}

function minutesToBoundary(d) {
  const t = d.getHours() * 60 + d.getMinutes();
  // 时辰边界：每个奇数整点（01:00、03:00 … 23:00）以及 00:00
  const bounds = [0, 60, 180, 300, 420, 540, 660, 780, 900, 1020, 1140, 1260, 1380, 1440];
  return Math.min(...bounds.map((b) => Math.abs(t - b)));
}

module.exports = { lookupLongitude, correct, hourIndex, HOUR_NAMES, pad };
