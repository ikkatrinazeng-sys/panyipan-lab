// 排盘核心：八字四柱 + 紫微斗数 + 流年四化
// 口径与 skills/mingli-master/scripts/calculate_bazi.py / calculate_chart.py 保持一致：
//   23:00 起换日；真太阳时校正后再排；起运 3 天 1 岁、1 天 4 个月、1 时辰 10 天；不排神煞；保留十二长生

const { astro, Solar, Lunar } = require('../libs/engine.js');
const { correct, hourIndex, HOUR_NAMES, pad } = require('./solar-time.js');

const GAN = '甲乙丙丁戊己庚辛壬癸';
const ZHI = '子丑寅卯辰巳午未申酉戌亥';
const GAN_WX = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
const ZHI_WX = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
const CHANG_SHENG = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
const CHANG_SHENG_START = { 甲: '亥', 乙: '午', 丙: '寅', 丁: '酉', 戊: '寅', 己: '酉', 庚: '巳', 辛: '子', 壬: '申', 癸: '卯' };

const MONTH_CLIMATE = {
  寅: ['孟春', '余寒未尽'], 卯: ['仲春', '温和'], 辰: ['季春', '渐暖偏湿'],
  巳: ['孟夏', '渐热'], 午: ['仲夏', '炎热'], 未: ['季夏', '热而燥'],
  申: ['孟秋', '余热渐凉'], 酉: ['仲秋', '凉燥'], 戌: ['季秋', '寒而燥'],
  亥: ['孟冬', '渐寒'], 子: ['仲冬', '严寒'], 丑: ['季冬', '寒而湿'],
};
const URGENT_TIAOHOU = { 子: '寒', 丑: '寒', 亥: '寒', 巳: '暖', 午: '暖', 未: '暖' };

// 只知道时辰时，取该时辰的中点来排八字
const SHICHEN_MID = [[0, 30], [2, 0], [4, 0], [6, 0], [8, 0], [10, 0], [12, 0], [14, 0], [16, 0], [18, 0], [20, 0], [22, 0], [23, 30]];

function isYang(gan) {
  return GAN.indexOf(gan) % 2 === 0;
}

function changSheng(gan, zhi) {
  let step = ZHI.indexOf(zhi) - ZHI.indexOf(CHANG_SHENG_START[gan]);
  if (!isYang(gan)) step = -step;
  return CHANG_SHENG[((step % 12) + 12) % 12];
}

function pillar(ec, name, dayGan) {
  const g = ec[`get${name}Gan`]();
  const z = ec[`get${name}Zhi`]();
  return {
    ganzhi: g + z,
    gan: g,
    zhi: z,
    ganWx: GAN_WX[g] + (isYang(g) ? '阳' : '阴'),
    zhiWx: ZHI_WX[z],
    shishenGan: name === 'Day' ? '日主' : ec[`get${name}ShiShenGan`](),
    hideGan: ec[`get${name}HideGan`](),
    shishenHide: ec[`get${name}ShiShenZhi`](),
    nayin: ec[`get${name}NaYin`](),
    xingyun: changSheng(dayGan, z),
    zizuo: changSheng(g, z),
  };
}

/**
 * @param {object} input
 *   calendar: 'solar' | 'lunar'
 *   year, month, day: number（农历时 month 为农历月）
 *   isLeap: boolean（农历闰月）
 *   timeMode: 'exact' | 'shichen'
 *   hh, mm: number（exact 时）
 *   shichen: 0-12（shichen 时）
 *   gender: '男' | '女'
 *   longitude: number | null
 *   now: Date（用于算当前流年，测试时可注入）
 */
function compute(input) {
  const now = input.now || new Date();

  // 1. 统一换成公历日期
  let sy = input.year, sm = input.month, sd = input.day;
  let lunarText = '';
  if (input.calendar === 'lunar') {
    const lunar = Lunar.fromYmd(input.year, input.isLeap ? -input.month : input.month, input.day);
    const solar = lunar.getSolar();
    sy = solar.getYear(); sm = solar.getMonth(); sd = solar.getDay();
  }

  // 2. 出生时刻 + 真太阳时
  let calc; // 用来排盘的时刻
  let correction = null;
  if (input.timeMode === 'exact') {
    const clock = new Date(sy, sm - 1, sd, input.hh, input.mm);
    if (input.longitude != null) {
      const r = correct(clock, input.longitude, true);
      calc = r.corrected;
      correction = r.detail;
    } else {
      calc = clock;
    }
  } else {
    const [h, m] = SHICHEN_MID[input.shichen];
    calc = new Date(sy, sm - 1, sd, h, m);
  }
  const tIdx = input.timeMode === 'exact' ? hourIndex(calc.getHours(), calc.getMinutes()) : input.shichen;

  const solar = Solar.fromYmdHms(calc.getFullYear(), calc.getMonth() + 1, calc.getDate(), calc.getHours(), calc.getMinutes(), 0);
  const lunar = solar.getLunar();
  lunarText = `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;

  // 3. 八字
  const ec = lunar.getEightChar();
  ec.setSect(1); // 23:00 起日柱换次日
  const dayGan = ec.getDayGan();
  const pillars = ['Year', 'Month', 'Day', 'Time'].map((n) => pillar(ec, n, dayGan));

  const wx = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  pillars.forEach((p) => { wx[GAN_WX[p.gan]] += 1; wx[ZHI_WX[p.zhi]] += 1; });

  const yun = ec.getYun(input.gender === '男' ? 1 : 0, 1);
  const thisYear = now.getFullYear();
  const dayun = yun.getDaYun().slice(1, 9).map((d) => ({
    ganzhi: d.getGanZhi(),
    startAge: d.getStartAge(),
    endAge: d.getEndAge(),
    startYear: d.getStartYear(),
    endYear: d.getEndYear(),
    current: d.getStartYear() <= thisYear && thisYear <= d.getEndYear(),
  }));
  const monthZhi = ec.getMonthZhi();
  const prevJie = lunar.getPrevJie();
  const nextJie = lunar.getNextJie();
  const jieGapDays = Math.min(
    Math.abs(solar.subtract(prevJie.getSolar())),
    Math.abs(nextJie.getSolar().subtract(solar))
  );

  const bazi = {
    text: pillars.map((p) => p.ganzhi).join(' '),
    pillars,
    dayMaster: { gan: dayGan, wx: GAN_WX[dayGan] + (isYang(dayGan) ? '阳' : '阴'), yuelingXingyun: changSheng(dayGan, monthZhi) },
    yueling: {
      zhi: monthZhi,
      season: MONTH_CLIMATE[monthZhi][0],
      climate: MONTH_CLIMATE[monthZhi][1],
      tiaohouUrgent: URGENT_TIAOHOU[monthZhi] || null,
      prevJie: `${prevJie.getName()} ${prevJie.getSolar().toYmdHms().slice(0, 16)}`,
      nextJie: `${nextJie.getName()} ${nextJie.getSolar().toYmdHms().slice(0, 16)}`,
      nearJie: jieGapDays <= 1,
    },
    wuxing: wx,
    qiyun: {
      direction: yun.isForward() ? '顺排' : '逆排',
      text: `出生后 ${yun.getStartYear()} 年 ${yun.getStartMonth()} 个月 ${yun.getStartDay()} 天起运`,
      date: yun.getStartSolar().toYmd(),
    },
    dayun,
  };

  // 4. 紫微斗数
  const dateStr = `${calc.getFullYear()}-${calc.getMonth() + 1}-${calc.getDate()}`;
  const a = astro.bySolar(dateStr, tIdx, input.gender, true, 'zh-CN');
  const palaces = a.palaces.map((p) => ({
    name: p.name === '仆役' ? '交友' : p.name,
    stem: p.heavenlyStem,
    branch: p.earthlyBranch,
    isBody: p.isBodyPalace,
    major: p.majorStars.map((s) => ({ name: s.name, brightness: s.brightness || '', mutagen: s.mutagen || '' })),
    minor: p.minorStars.map((s) => ({ name: s.name, brightness: s.brightness || '', mutagen: s.mutagen || '' })),
    decadal: p.decadal.range,
  }));

  // 5. 当前大限与流年
  const h = a.horoscope(`${thisYear}-7-1`, tIdx);
  const starPalace = {};
  palaces.forEach((p) => [...p.major, ...p.minor].forEach((s) => { starPalace[s.name] = p.name; }));
  const huaNames = ['禄', '权', '科', '忌'];
  const flights = (stars) => stars.map((star, i) => ({ hua: huaNames[i], star, palace: starPalace[star] || '—' }));
  const yearly = {
    year: thisYear,
    ganzhi: h.yearly.heavenlyStem + h.yearly.earthlyBranch,
    lifePalace: palaces[h.yearly.index].name,
    flights: flights(h.yearly.mutagen),
  };
  const decadal = {
    ganzhi: h.decadal.heavenlyStem + h.decadal.earthlyBranch,
    palace: palaces[h.decadal.index].name,
    range: palaces[h.decadal.index].decadal,
    flights: flights(h.decadal.mutagen),
  };

  // 过去十几年的流年四化与所在大限，供"验盘"出题（从 16 岁起，最多回看 12 年）
  const birthYear = calc.getFullYear();
  const history = [];
  for (let y = Math.max(birthYear + 15, thisYear - 12); y < thisYear; y++) {
    const hy = a.horoscope(`${y}-7-1`, tIdx);
    history.push({
      year: y,
      ganzhi: hy.yearly.heavenlyStem + hy.yearly.earthlyBranch,
      flights: flights(hy.yearly.mutagen),
      decadalPalace: palaces[hy.decadal.index].name,
    });
  }

  const ziwei = {
    history,
    birthYear,
    fiveElements: a.fiveElementsClass,
    soul: a.soul,
    body: a.body,
    palaces,
    soulBranch: a.earthlyBranchOfSoulPalace,
    bodyBranch: a.earthlyBranchOfBodyPalace,
    decadal,
    yearly,
    nominalAge: h.age.nominalAge,
  };

  return {
    input: {
      solarDate: `${sy}-${pad(sm)}-${pad(sd)}`,
      lunarText,
      time: input.timeMode === 'exact' ? `${pad(input.hh)}:${pad(input.mm)}` : `${HOUR_NAMES[input.shichen]}（未知具体时间）`,
      gender: input.gender,
    },
    correction,
    hourName: HOUR_NAMES[tIdx],
    bazi,
    ziwei,
  };
}

module.exports = { compute, changSheng };
