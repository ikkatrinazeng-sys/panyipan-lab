<div align="center">

# 盘一盘研究所 · 紫微斗数 + 八字 AI 算命 Skill

**Chinese Fortune Telling for Claude Code — Zi Wei Dou Shu & BaZi (Four Pillars)**

输入生辰 → 精确排盘 → 有主见、不装神的命理解读 → 一张古典书斋风格的可视化命盘

`Claude Code Skill` · `紫微斗数排盘` · `八字四柱` · `真太阳时` · `古籍有出处` · `可视化命盘`

<br>

<img src="assets/preview.png" alt="盘一盘研究所紫微斗数命盘示例" width="620">

</div>

---

## 一句话介绍

这是一个让 [Claude Code](https://claude.com/claude-code) 会**算命**的 skill：你告诉它出生年月日、时间和地点，它会用脚本**精确排出紫微斗数命盘或八字四柱**，再按古籍方法给出解读，并生成一张可以在浏览器打开的命盘图。

它跟市面上的算命工具最大的不同：

> **市面上九成的算命是一门恐惧生意——把话说得神神叨叨、无所不知，用一句"你命里有一劫"套住你，再卖你一个转运的方法。盘一盘研究所站在它的对立面：算得准的认真算，算不了的直接说算不了。**

---

## 能算什么

| 问题 | 用什么算 | 说明 |
|---|---|---|
| 我是什么性格、适合什么工作 | 紫微斗数 · 命宫 / 官禄宫 | 默认流程，生成可视化命盘 |
| 财运、感情、婚姻 | 紫微斗数 · 财帛宫 / 夫妻宫 | 讲模式和时机，不讲"你一定会" |
| 这十年、今明两年运势 | 紫微大限 / 流年四化 | 脚本算四化飞宫，不手算 |
| 哪一年适合买房 | 田宅宫流年四化 | 只到年份，不到楼盘 |
| 我的旺方在哪 | 八宅命卦（风水） | 会说明这是另一套系统，不是紫微 |
| 我和对象合不合 | 两人合盘 | 看互动模式，不判"能不能在一起" |
| 排八字、看用神 | 八字四柱 + 大运 | 调候 → 格局 → 旺衰三步法 |
| 结婚 / 开业选日子 | 择日 | 只给到月份，具体日子要对黄历 |

**不算的**：生死寿数、具体哪个小区哪栋楼、彩票股票、别人的隐私。问到这些，它会直接说算不了、为什么算不了。

---

## 特点

### 🎯 排盘精确：交给脚本，不让 AI 手算
- **真太阳时校正**：中国统一用北京时间，但西部出生的人，太阳时可能差一两个小时。脚本按出生城市经度自动校正，跨时辰时会提醒你
- **紫微斗数**：基于开源排盘库 [`iztro-py`](https://pypi.org/project/iztro-py/)，十二宫、主星辅星、四化、大限一次排全
- **八字四柱**：基于 [`lunar_python`](https://pypi.org/project/lunar_python/)，立春换年、节气换月、23 点换日，大运起运精确到"几岁几个月几天"

### 📜 古籍有出处：引一句就能查到原文
解读里引用的古书原话，都对照过原文电子本，并标了卷名或行号：

| 古籍 | 用在哪 | 参考文件 |
|---|---|---|
| 《紫微斗数全书》 | 紫微格局判断（君臣庆会、府相朝垣、七杀朝斗……） | `quanshu_reference.md` |
| 《子平真诠》 | 八字定格局：月令取用、顺用逆用、成败救应 | `bazi_reference.md` |
| 《滴天髓》 | 八字看旺衰：日主强弱、五行流通、中和 | `bazi_reference.md` |
| 《穷通宝鉴》 | 八字调候：十天干 × 十二月的寒暖燥湿用神（120 格原文） | `qiongtong_tiaohou.md` |

古书里"克妻""夭折""贫贱"这类吓人的话，只用来辅助判断，**不会原样转述给你**。

### 🗣 诚实人格：三条铁律
1. **分清能答和不能答**：超出命理能力的问题先划边界，不硬编一个"有用"的答案
2. **方法用错了当场承认**：不为了面子圆过去
3. **命盘是概率地图，不是判决书**：只说"这个格局倾向于……"，把决定权留给你

### 🎨 书斋风格可视化命盘
米白纸感 + 朱砂红 + 赭金，印章篆刻、中英混排。生成独立 HTML 文件，浏览器直接打开，可以截图分享。

### 🖐 手相互证 · 🔧 校准追问
- 可以上传手相照片，与命盘交叉验证
- 解读后会追问几个关键问题（比如"你是不是 2019 年前后换过工作"），用你的真实经历校准，把准确度从约 70% 往 85% 以上推

---

## 安装

```bash
git clone https://github.com/ikkatrinazeng-sys/panyipan-lab.git
cp -r panyipan-lab/skills/mingli-master ~/.claude/skills/
python3 -m pip install iztro-py lunar_python --user
```

---

## 手机网页版 / 小程序版

不装 Claude Code 也能用：

- **网页版**：下载 [`web/panyipan.html`](web/panyipan.html)，用手机或电脑浏览器直接打开。电子木鱼开场 → 填生辰 → 验盘、会诊、命盘、今年、合盘五个页面，全部本地计算。说明见 [`web/README.md`](web/README.md)
- **微信小程序版**：用微信开发者工具导入 [`miniprogram/`](miniprogram/) 文件夹，说明见 [`miniprogram/README.md`](miniprogram/README.md)

## 使用

在 Claude Code 里直接用中文说就行，skill 会自动触发：

```
帮我看看命盘：1995年4月29日 上午10点，女，湖南郴州出生
```

它会依次：确认是公历还是农历 → 问你最想看哪方面 → 排盘 → 解读 → 生成 HTML 命盘。

更多问法：

```
帮我排个八字：1990年6月15日 下午1点05分，男，乌鲁木齐
我今年事业运怎么样？
我哪一年适合买房？
帮我和对象合个盘
我的用神是什么？
```

**小提示**：出生时间越精确越好（精确到分钟），出生城市一定要说——时辰排错，整张盘就错了。

---

## 八字排盘口径

八字各门派排法有分歧，本 skill 统一按下面的口径，写死在脚本里：

| 项 | 口径 |
|---|---|
| 子时 | 23:00 起即算次日（日柱、时柱都换） |
| 真太阳时 | 必须校正，与紫微盘同一套算法 |
| 大运起运 | 3 天折 1 岁、1 天折 4 个月、1 个时辰折 10 天，精确到岁月日 |
| 神煞 | 不排（子平正统做法） |
| 十二长生 | 保留，作为旺衰辅助参考 |
| 解读顺序 | **先调候**（穷通宝鉴）→ **再定格局**（子平真诠）→ **最后看旺衰喜忌**（滴天髓） |

八字目前只用文字解读，暂不生成 HTML 命盘。

---

## 项目结构

```
skills/mingli-master/
├── SKILL.md                      # skill 主定义：触发条件、工作流程、禁忌
├── scripts/
│   ├── calculate_chart.py        # 紫微斗数排盘（含真太阳时校正）
│   ├── calculate_bazi.py         # 八字四柱排盘 + 大运
│   ├── calculate_horoscope.py    # 流年四化飞宫（买房 / 婚姻择年、合盘）
│   ├── calculate_bazhai.py       # 八宅命卦方位（风水模块）
│   └── generate_html.py          # 可视化命盘生成器
└── references/
    ├── interpretation_guide.md   # 解读人格与三条铁律（每次解读前必读）
    ├── stars_reference.md        # 十四主星 + 辅星煞星速查
    ├── four_hua_reference.md     # 四化飞星
    ├── quanshu_reference.md      # 《紫微斗数全书》赋文与格局
    ├── bazi_reference.md         # 八字三步解读法（子平真诠 / 滴天髓）
    ├── qiongtong_tiaohou.md      # 《穷通宝鉴》调候速查（十天干 × 十二月）
    └── extended_modules.md       # 买房择年 / 八宅方位 / 合盘 / 择日
```

仓库根目录的 `sample_output.html` 是一份完整的命盘示例，下载后用浏览器打开即可预览。

---

## 设计原则

- 不预言死亡
- 不制造恐惧
- 不替代你做人生决定
- 不说"你一定会"，只说"这个格局倾向于"

> 象由心生 · 命由象推。命盘显示可能性，行动决定现实。

---

## 致谢

- 紫微排盘：[iztro-py](https://pypi.org/project/iztro-py/)
- 八字排盘：[lunar_python](https://pypi.org/project/lunar_python/)
- 《紫微斗数全书》整理本：[SylarLong/iztro-docs](https://github.com/SylarLong/iztro-docs)
- 《子平真诠》《滴天髓》《穷通宝鉴》电子本：[lineeks/ancient-text-library](https://github.com/lineeks/ancient-text-library)

## License

[MIT](LICENSE) © [katrinazeng](https://github.com/ikkatrinazeng-sys)

<div align="center">
<br>
<code>盘</code>　盘一盘研究所 · 紫微斗数 + 八字 AI 算命 Skill
</div>
