# 盘一盘研究所 · 微信小程序版

紫微斗数 + 八字四柱排盘小程序。所有计算都在手机本地完成，**不需要服务器，不上传任何用户信息**。

## 功能

**首页（输入页）**：分五步引导填写，每步都有"怎么填"的提示
1. 称呼（选填）
2. 性别
3. 出生日期：公历 / 农历切换，农历支持闰月（如 2023 年闰二月）
4. 出生时间：知道几点几分 / 只知道时辰
5. 出生地点：省市区选择器自动查经度；海外或想更精确时可手动填经度

填写过程中实时显示"钟表时间 → 真太阳时（哪个时辰）"，校正后跨时辰或离时辰交界不到 10 分钟时会提醒。会记住上次填写的信息。

**结果页**：三个标签
- **八字**：四柱（十神、天干、地支、藏干、纳音、星运、自坐）、日主与月令调候、五行粗看、大运（当前大运高亮）
- **紫微**：传统 4×4 命盘，生年四化着色，点任意宫位看详情
- **今年**：当前大限四化、流年命宫与流年四化

底部"复制排盘结果"按钮会把整张盘复制成文字，可以直接粘贴给盘一盘研究所 skill 做详细解读。

## 排盘口径

与 `skills/mingli-master/scripts/` 下的 Python 脚本完全一致（已用同一命例交叉核对）：

- 23:00 起换日（日柱、时柱都算次日）
- 真太阳时：经度时差 + 均时差
- 大运起运：3 天折 1 岁、1 天折 4 个月、1 个时辰折 10 天
- 不排神煞，保留十二长生

## 怎么运行

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开开发者工具 → 导入项目 → 目录选本仓库的 `miniprogram/` 文件夹
3. AppID：没有的话先用"测试号"；有自己的小程序就把 `project.config.json` 里的 `touristappid` 换成你的 AppID
4. 点"编译"即可在模拟器里看到，点"预览"用手机微信扫码真机体验

## 上线前必须知道

**微信对"算命、占卜"类内容审核很严。** 《微信小程序平台运营规范》把占卜、算命类服务列为不允许的内容，这类小程序常见的结局是审核被拒，或者上线后被下架。如果要正式上线，建议：

- 先咨询微信官方客服或有上线经验的服务商，确认你的主体和类目能不能做
- 或者改走手机网页（H5）：同一套排盘代码可以直接搬到网页上，用微信打开链接就能用，不受小程序审核限制

自己开发预览、给朋友扫码体验（体验版）不受影响。

## 目录结构

```
miniprogram/
├── app.js / app.json / app.wxss     # 全局配置与书斋配色
├── pages/
│   ├── index/                       # 输入页
│   └── result/                      # 结果页（八字 / 紫微 / 今年）
├── utils/
│   ├── chart.js                     # 排盘核心：八字 + 紫微 + 流年
│   ├── solar-time.js                # 真太阳时校正与经度查询
│   └── lunar-picker.js              # 农历年月日选择器（含闰月）
└── libs/
    ├── engine.js                    # iztro + lunar-typescript 打包后的单文件
    └── cities.js                    # 地名 → 经度表
```

## 第三方库与数据

- [iztro](https://github.com/SylarLong/iztro)（MIT）：紫微斗数排盘
- [lunar-typescript](https://github.com/6tail/lunar-typescript)（MIT）：农历、节气、八字、大运
- 城市经度：[pyecharts city_coordinates.json](https://github.com/pyecharts/pyecharts)（MIT）

`libs/engine.js` 的生成方式（更新库版本时重新执行）：

```bash
npm i iztro esbuild
cat > entry.js <<'EOF'
const iztro = require('iztro');
const lunar = require('lunar-typescript');
module.exports = { astro: iztro.astro, Solar: lunar.Solar, Lunar: lunar.Lunar, LunarYear: lunar.LunarYear };
EOF
npx esbuild entry.js --bundle --format=cjs --platform=neutral --main-fields=main,module --target=es2017 --minify --outfile=libs/engine.js
```
