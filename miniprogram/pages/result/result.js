// 结果页：八字 / 紫微 / 今年 三个标签

// 紫微命盘传统排布：地支在 4×4 外圈的位置（行, 列），中间 2×2 放命主信息
const BRANCH_POS = {
  巳: [1, 1], 午: [1, 2], 未: [1, 3], 申: [1, 4],
  辰: [2, 1], 酉: [2, 4],
  卯: [3, 1], 戌: [3, 4],
  寅: [4, 1], 丑: [4, 2], 子: [4, 3], 亥: [4, 4],
};

const PILLAR_LABELS = ['年柱', '月柱', '日柱', '时柱'];
const WX_ORDER = ['木', '火', '土', '金', '水'];
// WXSS 类名用拼音，避免中文类名的兼容问题
const WX_KEY = { 木: 'mu', 火: 'huo', 土: 'tu', 金: 'jin', 水: 'shui' };
const HUA_KEY = { 禄: 'lu', 权: 'quan', 科: 'ke', 忌: 'ji' };

function palaceTitle(name) {
  return name.endsWith('宫') ? name : name + '宫';
}

function starText(s) {
  return s.name + (s.brightness ? `·${s.brightness}` : '');
}

function buildGrid(ziwei) {
  return ziwei.palaces.map((p, i) => {
    const [row, col] = BRANCH_POS[p.branch];
    return {
      idx: i,
      title: palaceTitle(p.name),
      ganzhi: p.stem + p.branch,
      style: `grid-row:${row};grid-column:${col};`,
      major: p.major.map((s) => ({ text: starText(s), hua: s.mutagen, huaKey: HUA_KEY[s.mutagen] || '' })),
      minor: p.minor.map((s) => s.name).join(' '),
      decadal: `${p.decadal[0]}–${p.decadal[1]}`,
      isSoul: p.name === '命宫',
      isBody: p.isBody,
      isDecadal: palaceTitle(p.name) === palaceTitle(ziwei.decadal.palace),
      isYearly: palaceTitle(p.name) === palaceTitle(ziwei.yearly.lifePalace),
      empty: p.major.length === 0,
    };
  });
}

function buildSummary(r) {
  const b = r.bazi;
  const z = r.ziwei;
  const lines = [];
  lines.push(`【盘一盘研究所排盘】${r.name ? r.name + ' ' : ''}${r.input.gender}`);
  lines.push(`公历 ${r.input.solarDate} ${r.input.time}（${r.input.lunarText}）`);
  if (r.correction) lines.push(`真太阳时 ${r.correction.trueSolarTime}（东经 ${r.correction.longitude}°，${r.correction.correctedHour}）`);
  lines.push('');
  lines.push(`八字：${b.text}　日主 ${b.dayMaster.gan}${b.dayMaster.wx}，生于${b.yueling.season}${b.yueling.zhi}月（${b.yueling.climate}）`);
  lines.push(`${b.qiyun.text}，${b.qiyun.direction}，交运 ${b.qiyun.date}`);
  lines.push('大运：' + b.dayun.map((d) => `${d.ganzhi}(${d.startYear})`).join(' '));
  lines.push('');
  lines.push(`紫微：${z.fiveElements}，命主${z.soul}，身主${z.body}`);
  z.palaces.forEach((p) => {
    const major = p.major.map((s) => s.name + (s.brightness || '') + (s.mutagen ? '化' + s.mutagen : '')).join(' ') || '空宫';
    const minor = p.minor.map((s) => s.name).join(' ');
    lines.push(`${palaceTitle(p.name)}(${p.stem}${p.branch})${p.isBody ? '[身]' : ''}：${major}${minor ? ' / ' + minor : ''}　大限${p.decadal[0]}-${p.decadal[1]}`);
  });
  lines.push('');
  lines.push(`当前大限 ${z.decadal.ganzhi}（${palaceTitle(z.decadal.palace)}）：` + z.decadal.flights.map((f) => `${f.star}化${f.hua}→${palaceTitle(f.palace)}`).join(' '));
  lines.push(`${z.yearly.year} ${z.yearly.ganzhi}年 流年命宫在${palaceTitle(z.yearly.lifePalace)}：` + z.yearly.flights.map((f) => `${f.star}化${f.hua}→${palaceTitle(f.palace)}`).join(' '));
  return lines.join('\n');
}

Page({
  data: {
    ready: false,
    tab: 'bazi',
    r: null,
    pillars: [],
    wuxing: [],
    grid: [],
    selected: null,
    flightsYear: [],
    flightsDecadal: [],
  },

  onLoad() {
    const r = getApp().globalData.result;
    if (!r) {
      wx.redirectTo({ url: '/pages/index/index' });
      return;
    }
    const maxWx = Math.max(...WX_ORDER.map((k) => r.bazi.wuxing[k]), 1);
    const grid = buildGrid(r.ziwei);
    const soulIdx = grid.findIndex((g) => g.isSoul);
    this.setData({
      ready: true,
      r,
      pillars: r.bazi.pillars.map((p, i) => ({
        ...p,
        label: PILLAR_LABELS[i],
        hide: p.hideGan.map((g, j) => `${g} ${p.shishenHide[j]}`),
        ganKey: WX_KEY[p.ganWx[0]],
        zhiKey: WX_KEY[p.zhiWx],
      })),
      wuxing: WX_ORDER.map((k) => ({ name: k, key: WX_KEY[k], n: r.bazi.wuxing[k], pct: Math.round((r.bazi.wuxing[k] / maxWx) * 100) })),
      grid,
      selected: grid[soulIdx],
      flightsYear: r.ziwei.yearly.flights.map((f) => ({ ...f, huaKey: HUA_KEY[f.hua], palace: palaceTitle(f.palace) })),
      flightsDecadal: r.ziwei.decadal.flights.map((f) => ({ ...f, huaKey: HUA_KEY[f.hua], palace: palaceTitle(f.palace) })),
      correctionMin: r.correction ? Math.round((r.correction.longitudeDeltaMin + r.correction.eotMin) * 10) / 10 : 0,
      decadalPalace: palaceTitle(r.ziwei.decadal.palace),
      yearlyPalace: palaceTitle(r.ziwei.yearly.lifePalace),
    });
    wx.setNavigationBarTitle({ title: r.name ? `${r.name}的命盘` : '我的命盘' });
  },

  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.t }); },

  pickPalace(e) { this.setData({ selected: this.data.grid[e.currentTarget.dataset.i] }); },

  copySummary() {
    wx.setClipboardData({
      data: buildSummary(this.data.r),
      success: () => wx.showToast({ title: '已复制，可粘贴给盘一盘研究所 skill 做解读', icon: 'none', duration: 2500 }),
    });
  },

  again() { wx.navigateBack({ fail: () => wx.redirectTo({ url: '/pages/index/index' }) }); },

  onShareAppMessage() {
    return { title: '盘一盘研究所 · 排一张你的紫微命盘和八字', path: '/pages/index/index' };
  },
});

module.exports = { buildGrid, buildSummary };
