// 盘一盘研究所 · 规则解读层：验盘出题、双系统会诊、合盘
// 全部是透明的简化规则，每条结论都带"依据"，方便用户追溯；不替代完整的人工 / AI 解读。

const GAN = '甲乙丙丁戊己庚辛壬癸';
const GAN_WX = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
const ZHI_WX = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
const ZHI_MAIN = { 子: '癸', 丑: '己', 寅: '甲', 卯: '乙', 辰: '戊', 巳: '丙', 午: '丁', 未: '己', 申: '庚', 酉: '辛', 戌: '戊', 亥: '壬' };
const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }; // 我生
const KE = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' };    // 我克
const WUHE = { 甲: '己', 己: '甲', 乙: '庚', 庚: '乙', 丙: '辛', 辛: '丙', 丁: '壬', 壬: '丁', 戊: '癸', 癸: '戊' };
const LIUHE = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' };
const LIUCHONG = { 子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅', 卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳' };
const LIUHAI = { 子: '未', 未: '子', 丑: '午', 午: '丑', 寅: '巳', 巳: '寅', 卯: '辰', 辰: '卯', 申: '亥', 亥: '申', 酉: '戌', 戌: '酉' };
const SHENGXIAO = { 子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龙', 巳: '蛇', 午: '马', 未: '羊', 申: '猴', 酉: '鸡', 戌: '狗', 亥: '猪' };

// 十四主星：白话画面 + 双面性（摘自 skills/mingli-master/references/stars_reference.md）
const STAR = {
  紫微: { pic: '天生想当那个"拿主意的人"，有格局感，受不了被瞎指挥', up: '有担当、有高度', down: '好面子、耳根软，容易被捧杀' },
  天机: { pic: '脑子转得快、想法多，适合当军师，不适合当莽夫', up: '机敏灵活', down: '想太多、善变、容易钻牛角尖' },
  太阳: { pic: '热心、爱照顾人，是付出型的人', up: '热情磊落', down: '爱操心、容易耗竭，对亲近的人付出过度' },
  武曲: { pic: '实干派，靠双手挣钱，认死理，不擅长甜言蜜语', up: '果断、能扛事', down: '固执、情感表达笨拙' },
  天同: { pic: '温和好相处，有点小确幸，不爱争抢', up: '知足平和', down: '缺冲劲，容易安逸过头' },
  廉贞: { pic: '气场复杂又迷人，感受力强，欲望也强，不是无聊的人', up: '有吸引力、有情趣', down: '情绪暗涌，容易走极端' },
  天府: { pic: '稳，有安全感，像个能兜住事的大管家', up: '踏实可靠、有容量', down: '保守、偏被动' },
  太阴: { pic: '细腻、温柔、审美好，重感受', up: '体贴有品味', down: '敏感多虑，容易内耗' },
  贪狼: { pic: '多才多艺、会社交，对世界充满好奇和欲望', up: '魅力和才华拉满，活得精彩', down: '贪新鲜、难满足、容易分心' },
  巨门: { pic: '靠嘴或靠专业吃饭，爱刨根问底，不轻易信人', up: '口才好、专业深', down: '多疑、爱较真，容易有口舌' },
  天相: { pic: '得力副手型，讲道理、爱帮忙、注重体面', up: '忠诚公正、有分寸', down: '缺主见、耳根软' },
  天梁: { pic: '老成、有原则，爱当那个"讲道理、管闲事"的人', up: '稳重可靠、能担事', down: '爱说教、固执、清高' },
  七杀: { pic: '狠角色，不怕压力，喜欢自己打天下', up: '果决有魄力、能开创', down: '冲动、起伏大' },
  破军: { pic: '破旧立新型，不安于现状，喜欢推倒重来', up: '敢突破、有魄力', down: '守不住、钱和感情起伏大' },
};

// 日主十天干的性格速写（八字验盘用）
const DAY_MASTER = {
  甲: '直、有上进心，像一棵想往上长的大树，不太会拐弯',
  乙: '柔韧、会变通，像藤蔓一样善于借力，外柔内韧',
  丙: '热情外放、爱表现，像太阳一样存在感强',
  丁: '外冷内热、心思细，像烛火一样照亮身边的人',
  戊: '稳重、守信用，像山一样让人有安全感，但有时固执',
  己: '包容、务实，像田地一样默默滋养别人，心思多',
  庚: '直接、讲义气、有决断，做事利落，有时显得硬',
  辛: '精致、自尊心强，像珠玉一样在意体面和细节',
  壬: '聪明、外向、点子多，像江河一样闲不住',
  癸: '敏感、细腻、有想象力，像雨露一样安静地渗透',
};

const BRIGHT_GOOD = ['庙', '旺', '得'];
const BRIGHT_BAD = ['陷', '不'];
const title = (n) => (n.endsWith('宫') ? n : n + '宫');
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function palaceOf(z, name) {
  return z.palaces.find((p) => title(p.name) === title(name));
}
function oppositeOf(z, p) {
  const ZHI = '子丑寅卯辰巳午未申酉戌亥';
  const b = ZHI[(ZHI.indexOf(p.branch) + 6) % 12];
  return z.palaces.find((q) => q.branch === b);
}
/** 某宫的主星；空宫借对宫 */
function mainStars(z, p) {
  if (p.major.length) return { stars: p.major, borrowed: false };
  return { stars: oppositeOf(z, p).major, borrowed: true };
}

// ================= 八字：强弱与喜忌（简化估算） =================

function relation(dayWx, wx) {
  if (wx === dayWx) return '比劫';
  if (SHENG[wx] === dayWx) return '印';
  if (SHENG[dayWx] === wx) return '食伤';
  if (KE[dayWx] === wx) return '财';
  return '官杀';
}

/**
 * 日主强弱：七个位置（三天干 + 四地支本气）帮身 +1、耗身 −1，月支权重 3、日支 1.5。
 * 只作方向参考，结果和依据一起展示。
 */
function strength(b) {
  const dm = b.dayMaster.gan;
  const dwx = GAN_WX[dm];
  const P = b.pillars;
  const items = [
    [P[0].gan, 1, '年干'], [P[1].gan, 1, '月干'], [P[3].gan, 1, '时干'],
    [ZHI_MAIN[P[0].zhi], 1, '年支'], [ZHI_MAIN[P[1].zhi], 3, '月令'], [ZHI_MAIN[P[2].zhi], 1.5, '日支'], [ZHI_MAIN[P[3].zhi], 1, '时支'],
  ];
  let score = 0;
  const help = [], drain = [];
  items.forEach(([g, w, pos]) => {
    const r = relation(dwx, GAN_WX[g]);
    const ok = r === '比劫' || r === '印';
    score += ok ? w : -w;
    (ok ? help : drain).push(`${pos}${g}（${r}）`);
  });
  const level = score >= 2 ? '身强' : score > 0 ? '中和偏强' : score === 0 ? '中和' : score > -2 ? '中和偏弱' : '身弱';
  const strong = score > 0;
  const xiRel = strong ? ['食伤', '财', '官杀'] : ['印', '比劫'];
  const all = ['木', '火', '土', '金', '水'];
  const xi = all.filter((w) => xiRel.includes(relation(dwx, w)));
  const ji = all.filter((w) => !xi.includes(w));
  return {
    score: Math.round(score * 10) / 10,
    level,
    strong,
    xi,
    ji,
    basis: `帮身：${help.join('、') || '无'}；耗身：${drain.join('、') || '无'}（月令权重 3、日支 1.5、其余 1，合计 ${Math.round(score * 10) / 10}）`,
  };
}

function wxScore(st, wx) {
  return st.xi.includes(wx) ? 1 : -1;
}

// ================= 验盘：用过去的事校准 =================

function buildQuestions(r) {
  const z = r.ziwei, b = r.bazi;
  const now = z.yearly.year;
  const qs = [];

  // 1. 紫微命宫性格
  const soul = palaceOf(z, '命宫');
  const ms = mainStars(z, soul);
  if (ms.stars.length) {
    const s = STAR[ms.stars[0].name];
    qs.push({
      id: 'zw-soul', system: '紫微',
      q: `你是不是这种人：${s.pic}？`,
      basis: `命宫${ms.borrowed ? '空宫，借对宫' : ''}主星 ${ms.stars.map((x) => x.name + (x.brightness ? '·' + x.brightness : '')).join('、')}；星性参考 stars_reference.md`,
    });
  }

  // 2. 八字日主性格
  qs.push({
    id: 'bz-dm', system: '八字',
    q: `朋友眼里的你，是不是${DAY_MASTER[b.dayMaster.gan]}？`,
    basis: `日主 ${b.dayMaster.gan}${b.dayMaster.wx}，生于${b.yueling.zhi}月（${b.dayMaster.yuelingXingyun}）`,
  });

  // 3. 紫微大限交接（只问已经过去、且 16 岁以后的）
  const age = (y) => y - z.birthYear + 1;
  const decadalTurns = z.palaces
    .map((p) => ({ p, year: z.birthYear + p.decadal[0] - 1 }))
    .filter((d) => d.year < now && age(d.year) >= 16)
    .sort((x, y) => y.year - x.year);
  if (decadalTurns.length) {
    const d = decadalTurns[0];
    qs.push({
      id: 'zw-decadal', system: '紫微',
      q: `${d.year} 年前后（虚岁 ${age(d.year)}），你的生活重心是不是有明显转变？比如换城市、换工作、开始或结束一段重要关系。`,
      basis: `紫微大限在 ${d.year} 年进入${title(d.p.name)}（${d.p.decadal[0]}–${d.p.decadal[1]} 岁）`,
    });
  }

  // 4. 八字交大运
  const dyTurns = b.dayun.filter((d) => d.startYear < now && age(d.startYear) >= 16).sort((x, y) => y.startYear - x.startYear);
  if (dyTurns.length) {
    const d = dyTurns[0];
    const dup = decadalTurns.length && Math.abs(decadalTurns[0].year - d.startYear) <= 1;
    if (!dup) {
      qs.push({
        id: 'bz-dayun', system: '八字',
        q: `${d.startYear} 年前后，你是不是感觉"换了一个阶段"，做事的节奏或者身边的人明显变了？`,
        basis: `八字在 ${d.startYear} 年交入 ${d.ganzhi} 大运`,
      });
    } else {
      qs[qs.length - 1].basis += `；八字也在 ${d.startYear} 年交入 ${d.ganzhi} 大运，两派指向同一时间`;
    }
  }

  // 5. 过去流年的具体事件
  const pickYear = (test) => z.history.slice().reverse().find((h) => h.year < now && h.flights.some(test));
  const career = pickYear((f) => (f.hua === '禄' || f.hua === '权') && title(f.palace) === '官禄宫');
  if (career) {
    const f = career.flights.find((x) => (x.hua === '禄' || x.hua === '权') && title(x.palace) === '官禄宫');
    qs.push({
      id: 'zw-career', system: '紫微',
      q: `${career.year} 年，你的工作或学业是不是有过进展？比如升职、加薪、拿到机会、考上学校。`,
      basis: `${career.year} ${career.ganzhi}年 流年${f.star}化${f.hua}入官禄宫`,
    });
  }
  const love = pickYear((f) => f.hua === '忌' && title(f.palace) === '夫妻宫');
  if (love) {
    const f = love.flights.find((x) => x.hua === '忌' && title(x.palace) === '夫妻宫');
    qs.push({
      id: 'zw-love', system: '紫微',
      q: `${love.year} 年，感情上是不是有过波动？比如争吵、冷淡、分开，或者为感情的事很操心。`,
      basis: `${love.year} ${love.ganzhi}年 流年${f.star}化忌入夫妻宫`,
    });
  }
  const self = pickYear((f) => f.hua === '忌' && title(f.palace) === '命宫');
  if (self && qs.length < 6) {
    qs.push({
      id: 'zw-self', system: '紫微',
      q: `${self.year} 年，你是不是过得比较累，压力大或者常常跟自己较劲？`,
      basis: `${self.year} ${self.ganzhi}年 流年${self.flights.find((x) => x.hua === '忌').star}化忌入命宫`,
    });
  }
  return qs.slice(0, 6);
}

/** answers: { id: 1 | 0.5 | 0 } */
function calibration(qs, answers) {
  const done = qs.filter((q) => answers[q.id] !== undefined);
  if (!done.length) return { answered: 0, total: qs.length, match: null, level: '未校准', advice: '回答下面几个关于过去的问题，看看这张盘准不准。' };
  const sum = done.reduce((s, q) => s + answers[q.id], 0);
  const match = Math.round((sum / done.length) * 100);
  let level, advice;
  if (done.length < 3) { level = '样本太少'; advice = '再多答几题，结论才有参考价值。'; }
  else if (match >= 70) { level = '吻合度高'; advice = '这张盘和你的经历对得上，后面的会诊结论可以重点参考。'; }
  else if (match >= 45) { level = '部分吻合'; advice = '有对得上的，也有对不上的。看会诊时，以"两派一致"的结论为主。'; }
  else { level = '吻合度低'; advice = '对不上的比较多，最常见的原因是出生时间不准。可以试试前一个或后一个时辰，看哪个更像你。'; }
  const bySys = {};
  done.forEach((q) => { (bySys[q.system] = bySys[q.system] || []).push(answers[q.id]); });
  const sys = Object.keys(bySys).map((k) => ({ system: k, match: Math.round(bySys[k].reduce((a, c) => a + c, 0) / bySys[k].length * 100), n: bySys[k].length }));
  return { answered: done.length, total: qs.length, match, level, advice, bySystem: sys, lowMatch: done.length >= 3 && match < 45 };
}

// ================= 双系统会诊 =================

function ziweiPalaceScore(z, name) {
  const p = palaceOf(z, name);
  const ms = mainStars(z, p);
  let score = 0;
  const why = [];
  ms.stars.forEach((s) => {
    if (BRIGHT_GOOD.includes(s.brightness)) { score += 0.5; why.push(`${s.name}${s.brightness}`); }
    if (BRIGHT_BAD.includes(s.brightness)) { score -= 0.5; why.push(`${s.name}${s.brightness}`); }
    if (s.mutagen === '禄' || s.mutagen === '权' || s.mutagen === '科') { score += 1; why.push(`${s.name}化${s.mutagen}`); }
    if (s.mutagen === '忌') { score -= 1; why.push(`${s.name}化忌`); }
  });
  p.minor.forEach((s) => {
    if (['禄存', '左辅', '右弼', '天魁', '天钺', '文昌', '文曲'].includes(s.name)) { score += 0.5; why.push(s.name); }
    if (['擎羊', '陀罗', '地空', '地劫', '火星', '铃星'].includes(s.name)) { score -= 0.5; why.push(s.name); }
    if (s.mutagen === '忌') { score -= 1; why.push(`${s.name}化忌`); }
  });
  const stars = ms.stars.map((s) => s.name).join('') || '空宫';
  return {
    score,
    stars,
    basis: `${title(name)}${ms.borrowed ? '（空宫借对宫）' : ''}主星 ${stars}${why.length ? '；' + why.join('、') : ''}`,
  };
}

function flightsScore(flights, good, bad) {
  let score = 0;
  const why = [];
  flights.forEach((f) => {
    const t = title(f.palace);
    if (f.hua !== '忌' && good.includes(t)) { score += 1; why.push(`${f.star}化${f.hua}入${t}`); }
    if (f.hua === '忌' && bad.includes(t)) { score -= 1; why.push(`${f.star}化忌入${t}`); }
  });
  return { score, why };
}

function sign(v) { return v > 0.25 ? 1 : v < -0.25 ? -1 : 0; }

function verdict(zs, bs) {
  const a = sign(zs), b = sign(bs);
  if (a === b && a !== 0) return { kind: 'agree', label: a > 0 ? '两派一致 · 偏顺' : '两派一致 · 需留意' };
  if (a === 0 && b === 0) return { kind: 'neutral', label: '两派都平' };
  if (a === 0 || b === 0) return { kind: 'half', label: '一派有信号' };
  return { kind: 'split', label: '两派分歧 · 不确定' };
}

function consult(r) {
  const z = r.ziwei, b = r.bazi;
  const st = strength(b);
  const dwx = GAN_WX[b.dayMaster.gan];
  const P = b.pillars;
  const chars = [P[0].gan, P[1].gan, P[3].gan, ...P.map((p) => ZHI_MAIN[p.zhi])];
  const countRel = (rel) => chars.filter((g) => relation(dwx, GAN_WX[g]) === rel).length;
  const relWx = (rel) => ['木', '火', '土', '金', '水'].find((w) => relation(dwx, w) === rel);
  const topics = [];

  // 事业
  {
    const zw = ziweiPalaceScore(z, '官禄宫');
    const gx = relWx('官杀');
    const n = countRel('官杀');
    const bs = n ? (st.xi.includes(gx) ? 1 : -1) : 0;
    topics.push({
      key: 'career', name: '事业',
      ziwei: { score: zw.score, text: zw.score > 0 ? '事业宫有助力，靠能力能打开局面' : zw.score < 0 ? '事业宫有阻力，进展会比预期慢' : '事业宫不偏不倚，看大限流年', basis: zw.basis },
      bazi: { score: bs, text: n ? (bs > 0 ? `官杀（${gx}）是喜神，平台和规则能成就你` : `官杀（${gx}）是忌神，压力大于助力，宜自主一点`) : '原局官杀不显，事业看大运引动', basis: `${st.level}，喜 ${st.xi.join('')}；原局官杀 ${n} 个` },
    });
  }
  // 财运
  {
    const zw = ziweiPalaceScore(z, '财帛宫');
    const cx = relWx('财');
    const n = countRel('财');
    const bs = n ? (st.xi.includes(cx) ? 1 : -1) : 0;
    topics.push({
      key: 'wealth', name: '财运',
      ziwei: { score: zw.score, text: zw.score > 0 ? '财帛宫有吉星，赚钱能力在线' : zw.score < 0 ? '财帛宫有耗星，进得来也容易出去' : '财帛宫平稳，靠积累', basis: zw.basis },
      bazi: { score: bs, text: n ? (bs > 0 ? `财星（${cx}）是喜神，身体扛得住财，宜主动求财` : `财星（${cx}）是忌神，财多身弱，宜稳不宜贪`) : '原局财星不显，财运看大运', basis: `${st.level}，喜 ${st.xi.join('')}；原局财星 ${n} 个` },
    });
  }
  // 感情
  {
    const zw = ziweiPalaceScore(z, '夫妻宫');
    const rel = r.input.gender === '女' ? '官杀' : '财';
    const sx = relWx(rel);
    const n = countRel(rel);
    const dayZhi = P[2].zhi;
    const chong = P.filter((p, i) => i !== 2 && LIUCHONG[dayZhi] === p.zhi).map((p) => p.zhi);
    const hai = P.filter((p, i) => i !== 2 && LIUHAI[dayZhi] === p.zhi).map((p) => p.zhi);
    let bs = n ? (st.xi.includes(sx) ? 1 : -1) : 0;
    if (chong.length) bs -= 1;
    if (hai.length) bs -= 0.5;
    topics.push({
      key: 'love', name: '感情',
      ziwei: { score: zw.score, text: zw.score > 0 ? '夫妻宫有助力，伴侣能给你支撑' : zw.score < 0 ? '夫妻宫有压力，感情需要多经营' : '夫妻宫平稳', basis: zw.basis },
      bazi: { score: bs, text: (n ? (st.xi.includes(sx) ? `配偶星（${sx}）是喜神，另一半对你是加分项` : `配偶星（${sx}）是忌神，关系里容易有拉扯`) : '原局配偶星不显，缘分看大运') + (chong.length ? `；日支${dayZhi}被${chong.join('')}冲，婚姻宫不太安稳` : '') + (hai.length ? `；日支${dayZhi}与${hai.join('')}相害，容易有说不出口的小委屈` : ''), basis: `${r.input.gender}命以${rel}为配偶星，原局 ${n} 个；日支 ${dayZhi}${chong.length ? '，逢冲' : ''}${hai.length ? `，与${hai.join('')}相害` : ''}` },
    });
  }
  // 当前十年
  {
    const fs = flightsScore(z.decadal.flights, ['命宫', '财帛宫', '官禄宫', '田宅宫', '福德宫'], ['命宫', '财帛宫', '官禄宫', '夫妻宫']);
    const dy = b.dayun.find((d) => d.current) || b.dayun[0];
    const bs = wxScore(st, GAN_WX[dy.ganzhi[0]]) + wxScore(st, ZHI_WX[dy.ganzhi[1]]);
    topics.push({
      key: 'decade', name: '这十年',
      ziwei: { score: fs.score, text: fs.score > 0 ? '大限四化偏吉，是往上走的十年' : fs.score < 0 ? '大限有化忌压在要害宫位，是打磨的十年' : '大限四化吉凶参半', basis: `大限 ${z.decadal.ganzhi}（${title(z.decadal.palace)}）：${fs.why.join('、') || '四化未落要害宫位'}` },
      bazi: { score: bs, text: bs > 0 ? `${dy.ganzhi} 大运干支都是喜神，顺风期` : bs < 0 ? `${dy.ganzhi} 大运干支都是忌神，逆风期，稳字当头` : `${dy.ganzhi} 大运一喜一忌，有起有落`, basis: `当前大运 ${dy.ganzhi}（${dy.startYear}–${dy.endYear}）：天干${GAN_WX[dy.ganzhi[0]]}、地支${ZHI_WX[dy.ganzhi[1]]}；喜 ${st.xi.join('')}` },
    });
  }
  // 今年
  {
    const fs = flightsScore(z.yearly.flights, ['命宫', '财帛宫', '官禄宫', '田宅宫', '迁移宫'], ['命宫', '财帛宫', '官禄宫', '夫妻宫']);
    const gz = z.yearly.ganzhi;
    const bs = wxScore(st, GAN_WX[gz[0]]) + wxScore(st, ZHI_WX[gz[1]]);
    topics.push({
      key: 'year', name: `${z.yearly.year} 年`,
      ziwei: { score: fs.score, text: fs.score > 0 ? '流年吉化落在要害宫位，有顺势的机会' : fs.score < 0 ? '流年化忌落在要害宫位，今年的课题比较明确' : '流年四化不偏不倚', basis: `流年 ${gz}，流年命宫在${title(z.yearly.lifePalace)}：${fs.why.join('、') || '四化未落要害宫位'}` },
      bazi: { score: bs, text: bs > 0 ? `${gz} 年干支都是喜神，顺` : bs < 0 ? `${gz} 年干支都是忌神，多守少攻` : `${gz} 年一喜一忌，好坏参半`, basis: `流年 ${gz}：天干${GAN_WX[gz[0]]}、地支${ZHI_WX[gz[1]]}；喜 ${st.xi.join('')}、忌 ${st.ji.join('')}` },
    });
  }

  topics.forEach((t) => { t.verdict = verdict(t.ziwei.score, t.bazi.score); });
  return { strength: st, topics };
}

// ================= 合盘 =================

function synastry(a, b) {
  const items = [];
  const add = (kind, title_, text, basis, w) => items.push({ kind, title: title_, text, basis, w });
  const an = a.name || '你', bn = b.name || '对方';
  const ad = a.bazi.dayMaster.gan, bd = b.bazi.dayMaster.gan;
  const aw = GAN_WX[ad], bw = GAN_WX[bd];

  // 日干：五合 / 生 / 克 / 同
  if (WUHE[ad] === bd) add('plus', '日主相合', '两个人的"本我"天然相吸，相处有默契，容易一见如故。', `${an}日主${ad}，${bn}日主${bd}，${ad}${bd}五合`, 2);
  else if (SHENG[aw] === bw) add('plus', `${an}生${bn}`, `${an}更愿意付出、照顾对方，${bn}在关系里更被滋养。`, `${ad}${aw}生${bd}${bw}`, 1);
  else if (SHENG[bw] === aw) add('plus', `${bn}生${an}`, `${bn}更愿意付出、照顾对方，${an}在关系里更被滋养。`, `${bd}${bw}生${ad}${aw}`, 1);
  else if (KE[aw] === bw) add('minus', `${an}克${bn}`, `${an}容易不自觉地管着、压着对方，${bn}会觉得有压力。说话放软一点会好很多。`, `${ad}${aw}克${bd}${bw}`, -1);
  else if (KE[bw] === aw) add('minus', `${bn}克${an}`, `${bn}容易不自觉地管着、压着对方，${an}会觉得有压力。说话放软一点会好很多。`, `${bd}${bw}克${ad}${aw}`, -1);
  else add('neutral', '日主同类', '性格底色相近，像朋友也像对手，好处是懂彼此，坏处是容易较劲。', `${ad}与${bd}同属${aw}`, 0);

  // 日支（夫妻宫位）
  const az = a.bazi.pillars[2].zhi, bz = b.bazi.pillars[2].zhi;
  if (LIUHE[az] === bz) add('plus', '日支六合', '生活习惯和节奏合得来，住在一起不太会因为小事闹别扭。', `${an}日支${az}，${bn}日支${bz}，${az}${bz}六合`, 1.5);
  else if (LIUCHONG[az] === bz) add('minus', '日支相冲', '生活节奏差别大，一个想动一个想静。最容易吵的是日常琐事，提前说好分工能少很多摩擦。', `${az}${bz}相冲`, -1.5);
  else if (LIUHAI[az] === bz) add('minus', '日支相害', '容易有"说不出口的小委屈"，积多了会伤感情，记得及时说开。', `${az}${bz}相害`, -1);

  // 年支（生肖）
  const ay = a.bazi.pillars[0].zhi, by = b.bazi.pillars[0].zhi;
  const sx = `${SHENGXIAO[ay]}和${SHENGXIAO[by]}`;
  if (LIUHE[ay] === by) add('plus', '生肖六合', '家庭背景、价值观容易合拍，双方家人也比较好相处。', `${sx}：${ay}${by}六合`, 1);
  else if (LIUCHONG[ay] === by) add('minus', '生肖相冲', '成长环境和观念差异较大，见家长、谈婚嫁时要多一些耐心。', `${sx}：${ay}${by}相冲`, -1);

  // 五行互补：对方日主五行正是我的喜神
  const sa = strength(a.bazi), sb = strength(b.bazi);
  if (sa.xi.includes(bw)) add('plus', `${bn}补${an}`, `${bn}身上的特质，正好是${an}命里缺、也最需要的那股能量。`, `${an}${sa.level}，喜${sa.xi.join('')}；${bn}日主属${bw}`, 1);
  if (sb.xi.includes(aw)) add('plus', `${an}补${bn}`, `${an}身上的特质，正好是${bn}命里缺、也最需要的那股能量。`, `${bn}${sb.level}，喜${sb.xi.join('')}；${an}日主属${aw}`, 1);

  // 紫微：对方命宫主星是否落在我的夫妻宫
  const pick = (r, name) => mainStars(r.ziwei, palaceOf(r.ziwei, name)).stars.map((s) => s.name);
  const aSpouse = pick(a, '夫妻宫'), bSoul = pick(b, '命宫');
  const bSpouse = pick(b, '夫妻宫'), aSoul = pick(a, '命宫');
  const hitA = bSoul.filter((s) => aSpouse.includes(s));
  const hitB = aSoul.filter((s) => bSpouse.includes(s));
  if (hitA.length) add('plus', `${bn}像${an}的"理想型"`, `${an}命盘里理想伴侣的样子（夫妻宫${aSpouse.join('')}），正好是${bn}的本色。`, `${an}夫妻宫 ${aSpouse.join('')}；${bn}命宫 ${bSoul.join('')}`, 1.5);
  if (hitB.length) add('plus', `${an}像${bn}的"理想型"`, `${bn}命盘里理想伴侣的样子（夫妻宫${bSpouse.join('')}），正好是${an}的本色。`, `${bn}夫妻宫 ${bSpouse.join('')}；${an}命宫 ${aSoul.join('')}`, 1.5);
  if (!hitA.length && !hitB.length) add('neutral', '紫微星性', `${an}的命宫是${aSoul.join('') || '空宫'}，${bn}的命宫是${bSoul.join('') || '空宫'}。不在彼此的"理想型"里，靠相处慢慢磨合。`, `${an}夫妻宫 ${aSpouse.join('')}；${bn}夫妻宫 ${bSpouse.join('')}`, 0);

  const raw = items.reduce((s, it) => s + it.w, 0);
  const index = clamp(Math.round(60 + raw * 7), 20, 98);
  const mood = index >= 80 ? '天生合拍型' : index >= 65 ? '互补成长型' : index >= 50 ? '磨合型' : '挑战型';
  return { index, mood, items, raw };
}

module.exports = { strength, buildQuestions, calibration, consult, synastry, STAR };
