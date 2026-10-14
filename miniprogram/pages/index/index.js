const { compute } = require('../../utils/chart.js');
const { lookupLongitude, correct, pad } = require('../../utils/solar-time.js');
const lunarPicker = require('../../utils/lunar-picker.js');

const STORAGE_KEY = 'panyipan_last_input';

const SHICHEN_LIST = [
  '早子时 00:00–01:00', '丑时 01:00–03:00', '寅时 03:00–05:00', '卯时 05:00–07:00',
  '辰时 07:00–09:00', '巳时 09:00–11:00', '午时 11:00–13:00', '未时 13:00–15:00',
  '申时 15:00–17:00', '酉时 17:00–19:00', '戌时 19:00–21:00', '亥时 21:00–23:00',
  '晚子时 23:00–24:00',
];

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

Page({
  data: {
    name: '',
    gender: '',
    calendar: 'solar',
    solarDate: '',
    lunar: null, // lunarPicker.build() 的结果
    lunarPicked: false,
    timeMode: 'exact',
    time: '',
    shichenList: SHICHEN_LIST,
    shichen: -1,
    region: [],
    longitude: null,
    longitudeSource: '',
    manualLon: false,
    manualLonText: '',
    preview: '',
    previewWarn: '',
    canSubmit: false,
    today: today(),
    hasLast: false,
  },

  onLoad() {
    this.setData({ lunar: lunarPicker.initial() });
    try {
      this.setData({ hasLast: !!wx.getStorageSync(STORAGE_KEY) });
    } catch (e) { /* 本地存储不可用时忽略 */ }
  },

  // ---------- 表单交互 ----------
  onName(e) { this.setData({ name: e.detail.value }); },

  pickGender(e) { this.setData({ gender: e.currentTarget.dataset.v }, this.refresh); },

  pickCalendar(e) { this.setData({ calendar: e.currentTarget.dataset.v }, this.refresh); },

  onSolarDate(e) { this.setData({ solarDate: e.detail.value }, this.refresh); },

  onLunarColumn(e) {
    const idx = this.data.lunar.index.slice();
    idx[e.detail.column] = e.detail.value;
    if (e.detail.column < 2) idx[2] = Math.min(idx[2], 28); // 换年/月时日不越界，build 里会再夹一次
    this.setData({ lunar: lunarPicker.build(idx[0], idx[1], idx[2]) });
  },

  onLunarDate(e) {
    const [y, m, d] = e.detail.value;
    this.setData({ lunar: lunarPicker.build(y, m, d), lunarPicked: true }, this.refresh);
  },

  pickTimeMode(e) { this.setData({ timeMode: e.currentTarget.dataset.v }, this.refresh); },

  onTime(e) { this.setData({ time: e.detail.value }, this.refresh); },

  onShichen(e) { this.setData({ shichen: Number(e.detail.value) }, this.refresh); },

  onRegion(e) {
    const region = e.detail.value;
    const hit = lookupLongitude(region);
    this.setData({
      region,
      manualLon: !hit,
      longitude: hit ? hit.longitude : null,
      longitudeSource: hit ? hit.source : '',
    }, this.refresh);
    if (!hit) wx.showToast({ title: '没查到经度，请手动填写', icon: 'none' });
  },

  toggleManualLon() {
    this.setData({ manualLon: !this.data.manualLon });
  },

  onManualLon(e) {
    const v = parseFloat(e.detail.value);
    const ok = !isNaN(v) && v > 70 && v < 140;
    this.setData({
      manualLonText: e.detail.value,
      longitude: ok ? v : null,
      longitudeSource: ok ? '手动填写' : '',
    }, this.refresh);
  },

  // ---------- 实时预览 ----------
  dateParts() {
    const d = this.data;
    if (d.calendar === 'solar') {
      if (!d.solarDate) return null;
      const [y, m, day] = d.solarDate.split('-').map(Number);
      return { calendar: 'solar', year: y, month: m, day };
    }
    if (!d.lunarPicked) return null;
    const v = d.lunar.value;
    return { calendar: 'lunar', year: v.year, month: v.month, day: v.day, isLeap: v.isLeap };
  },

  buildInput() {
    const d = this.data;
    const date = this.dateParts();
    if (!d.gender || !date) return null;
    if (d.timeMode === 'exact' && !d.time) return null;
    if (d.timeMode === 'shichen' && d.shichen < 0) return null;
    if (d.longitude == null) return null;
    const input = { ...date, gender: d.gender, timeMode: d.timeMode, longitude: d.longitude };
    if (d.timeMode === 'exact') {
      const [hh, mm] = d.time.split(':').map(Number);
      input.hh = hh; input.mm = mm;
    } else {
      input.shichen = d.shichen;
    }
    return input;
  },

  refresh() {
    const input = this.buildInput();
    let preview = '';
    let previewWarn = '';
    if (input && input.timeMode === 'exact') {
      try {
        const r = compute({ ...input });
        const c = r.correction;
        preview = `公历 ${r.input.solarDate} ${c.clockTime} → 真太阳时 ${c.trueSolarTime.slice(11)}（${c.correctedHour}）`;
        if (c.crossedBoundary) previewWarn = `校正后从${c.naiveHour}变成了${c.correctedHour}，会按${c.correctedHour}排盘`;
        else if (c.nearBoundary) previewWarn = '离时辰交界不到 10 分钟，出生时间如有误差，时辰可能不同';
      } catch (e) {
        preview = '';
      }
    } else if (input) {
      preview = '只知道时辰：不做真太阳时校正，按时辰中点排盘，准确度会打折';
    }
    this.setData({ canSubmit: !!input, preview, previewWarn });
  },

  // ---------- 提交 ----------
  submit() {
    const input = this.buildInput();
    if (!input) {
      const d = this.data;
      const missing = !d.gender ? '性别' : !this.dateParts() ? '出生日期'
        : (d.timeMode === 'exact' ? !d.time : d.shichen < 0) ? '出生时间' : '出生地点';
      wx.showToast({ title: `请先填写${missing}`, icon: 'none' });
      return;
    }
    wx.showLoading({ title: '排盘中' });
    try {
      const result = compute(input);
      result.name = this.data.name.trim();
      getApp().globalData.result = result;
      try {
        wx.setStorageSync(STORAGE_KEY, { ...this.data, lunar: undefined, shichenList: undefined, lunarIndex: this.data.lunar.index });
      } catch (e) { /* 忽略 */ }
      wx.hideLoading();
      wx.navigateTo({ url: '/pages/result/result' });
    } catch (e) {
      wx.hideLoading();
      wx.showModal({ title: '排盘失败', content: String(e && e.message || e), showCancel: false });
    }
  },

  fillLast() {
    try {
      const last = wx.getStorageSync(STORAGE_KEY);
      if (!last) return;
      const idx = last.lunarIndex || [1995 - 1901, 0, 0];
      this.setData({
        name: last.name, gender: last.gender, calendar: last.calendar, solarDate: last.solarDate,
        lunar: lunarPicker.build(idx[0], idx[1], idx[2]), lunarPicked: last.lunarPicked,
        timeMode: last.timeMode, time: last.time, shichen: last.shichen,
        region: last.region, longitude: last.longitude, longitudeSource: last.longitudeSource,
        manualLon: last.manualLon, manualLonText: last.manualLonText,
      }, this.refresh);
    } catch (e) { /* 忽略 */ }
  },

  onShareAppMessage() {
    return { title: '盘一盘研究所 · 排一张你的紫微命盘和八字', path: '/pages/index/index' };
  },
});
